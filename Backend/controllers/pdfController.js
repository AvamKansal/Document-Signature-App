const fs = require("fs");
const path = require("path");
const { PDFDocument, rgb } = require("pdf-lib");

const Document = require("../models/Document");
const Field = require("../models/Field");
const AuditLog = require("../models/AuditLog");
const createAuditLog = require("../utils/createAuditLog");

const generateSignedPdf = async (req, res) => {
  try {
    const { documentId } = req.params;

    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    const fields = await Field.find({ documentId, status: "Filled" });

    const pdfPath = path.join(__dirname, "..", document.filePath);
    if (!fs.existsSync(pdfPath)) {
      return res.status(404).json({ message: "Source PDF not found" });
    }

    const existingPdfBytes = fs.readFileSync(pdfPath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const pages = pdfDoc.getPages();

    // Loop over each filled field and render it on the PDF
    for (const field of fields) {
      if (!pages[field.page - 1]) continue;
      const page = pages[field.page - 1];
      const { width, height } = page.getSize();

      const px = (field.x / 100) * width;
      const py = height - (field.y / 100) * height;
      
      // Calculate dynamic dimensions in PDF points
      const fW = ((field.width || 15) / 100) * width;
      const fH = ((field.height || 5) / 100) * height;

      if (field.type === "signature" || field.type === "initials") {
        if (field.value) {
          const sigImgPath = path.join(__dirname, "..", field.value);
          if (fs.existsSync(sigImgPath)) {
            const sigImgBytes = fs.readFileSync(sigImgPath);
            try {
              const sigImage = await pdfDoc.embedPng(sigImgBytes);
              // Draw signature/initial image using customizable bounds
              page.drawImage(sigImage, {
                x: px,
                y: py - fH,
                width: fW,
                height: fH,
              });
            } catch (err) {
              console.error("Failed to embed signature PNG:", err.message);
              // Fallback to text if PNG embedding fails
              page.drawText(field.type === "signature" ? "[Signature]" : "[Initials]", {
                x: px,
                y: py - fH + 4,
                size: Math.min(10, fH * 0.6),
                color: rgb(0, 0, 1),
              });
            }
          }
        }
      } else if (field.type === "text" || field.type === "date") {
        // Draw text within custom bounds
        const fontSize = Math.max(8, Math.min(11, fH * 0.6));
        page.drawText(field.value || "", {
          x: px,
          y: py - fH + 4,
          size: fontSize,
          color: rgb(0, 0, 0),
        });
      } else if (field.type === "checkbox") {
        // Draw box border using customizable bounds
        page.drawRectangle({
          x: px,
          y: py - fH,
          width: fW,
          height: fH,
          borderWidth: 1,
          borderColor: rgb(0, 0, 0),
        });
        // Draw cross in center if checked
        if (field.value === "true") {
          const fontSize = Math.max(8, Math.min(11, fH * 0.8));
          page.drawText("X", {
            x: px + (fW / 2) - (fontSize / 3.5),
            y: py - (fH / 2) - (fontSize / 3),
            size: fontSize,
            color: rgb(0, 0, 0),
          });
        }
      }
    }

    // Append Certificate of Completion
    const certPage = pdfDoc.addPage();
    const { width: cW, height: cH } = certPage.getSize();

    // Draw borders
    certPage.drawRectangle({
      x: 20,
      y: 20,
      width: cW - 40,
      height: cH - 40,
      borderWidth: 2,
      borderColor: rgb(0.3, 0.3, 0.9),
    });

    certPage.drawText("E-SIGNATURE AUDIT CERTIFICATE", {
      x: 40,
      y: cH - 60,
      size: 20,
      color: rgb(0.2, 0.2, 0.7),
    });

    certPage.drawText(`Document Title: ${document.title}`, {
      x: 40,
      y: cH - 90,
      size: 12,
      color: rgb(0, 0, 0),
    });

    certPage.drawText(`Document ID: ${document._id}`, {
      x: 40,
      y: cH - 110,
      size: 10,
      color: rgb(0.4, 0.4, 0.4),
    });

    certPage.drawText(`Uploaded Date: ${new Date(document.createdAt).toLocaleString()}`, {
      x: 40,
      y: cH - 130,
      size: 10,
      color: rgb(0.4, 0.4, 0.4),
    });

    // Draw divider
    certPage.drawLine({
      start: { x: 40, y: cH - 150 },
      end: { x: cW - 40, y: cH - 150 },
      thickness: 1,
      color: rgb(0.8, 0.8, 0.8),
    });

    // Draw Signer list
    certPage.drawText("SIGNER STATUS SUMMARY", {
      x: 40,
      y: cH - 180,
      size: 14,
      color: rgb(0.2, 0.2, 0.7),
    });

    let currentY = cH - 210;
    document.signers.forEach((signer, idx) => {
      certPage.drawText(`${idx + 1}. Name: ${signer.name || "N/A"} (${signer.email})`, {
        x: 40,
        y: currentY,
        size: 11,
        color: rgb(0, 0, 0),
      });
      certPage.drawText(`Status: ${signer.status} ${signer.signedAt ? `| Signed At: ${new Date(signer.signedAt).toLocaleString()}` : ""}`, {
        x: 60,
        y: currentY - 15,
        size: 10,
        color: signer.status === "Signed" ? rgb(0, 0.6, 0.1) : rgb(0.8, 0.5, 0),
      });
      currentY -= 35;
    });

    // Draw divider
    certPage.drawLine({
      start: { x: 40, y: currentY - 10 },
      end: { x: cW - 40, y: currentY - 10 },
      thickness: 1,
      color: rgb(0.8, 0.8, 0.8),
    });

    // Draw Audit Log
    certPage.drawText("AUDIT LOG HISTORY", {
      x: 40,
      y: currentY - 40,
      size: 14,
      color: rgb(0.2, 0.2, 0.7),
    });

    const logs = await AuditLog.find({ documentId }).sort({ createdAt: 1 });
    let logY = currentY - 70;
    logs.forEach((log) => {
      if (logY < 50) return; // avoid drawing past page boundary
      const logTime = new Date(log.createdAt).toLocaleString();
      certPage.drawText(`[${logTime}] ${log.action}: ${log.details || ""}`, {
        x: 40,
        y: logY,
        size: 9,
        color: rgb(0.3, 0.3, 0.3),
      });
      logY -= 20;
    });

    const pdfBytes = await pdfDoc.save();

    const uploadsDir = path.join(__dirname, "..", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const outputPath = path.join(uploadsDir, `signed-${documentId}-${Date.now()}.pdf`);
    fs.writeFileSync(outputPath, pdfBytes);

    await createAuditLog({
      documentId,
      userId: req.user?._id || document.uploadedBy,
      action: "SIGNED_PDF_GENERATED",
      details: `Completed PDF compilation generated.`,
    });

    res.download(outputPath, `signed-document-${document.title.replace(/\s+/g, "_")}.pdf`);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  generateSignedPdf,
};