const fs = require("fs");
const path = require("path");
const { PDFDocument, rgb } = require("pdf-lib");

const Document = require("../models/Document");
const Signature = require("../models/Signature");

const generateSignedPdf = async (req, res) => {
  try {
    const { documentId } = req.params;

    const document = await Document.findById(
      documentId
    );

    if (!document) {
      return res
        .status(404)
        .json({ message: "Document not found" });
    }

    const signatures =
      await Signature.find({
        documentId,
      });

    const pdfPath = path.join(
      __dirname,
      "..",
      document.filePath
    );

    const existingPdfBytes =
      fs.readFileSync(pdfPath);

    const pdfDoc =
      await PDFDocument.load(
        existingPdfBytes
      );

    const pages = pdfDoc.getPages();

    signatures.forEach((sig) => {
    if (!pages[sig.page - 1]) return;
      const page =pages[sig.page - 1];

      const { width, height } =
        page.getSize();

      page.drawText(
        "SIGNED",
        {
          x:
            (sig.x / 100) *
            width,
          y:
            height -
            (sig.y / 100) *
              height,
          size: 16,
          color: rgb(0, 0, 1),
        }
      );
    });

    const pdfBytes =
      await pdfDoc.save();

    const outputPath = path.join(
      __dirname,
      "..",
      "uploads",
      `signed-${Date.now()}.pdf`
    );

    fs.writeFileSync(
      outputPath,
      pdfBytes
    );
    res.download(
        outputPath,
        `signed-document-${documentId}.pdf`
    );

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  generateSignedPdf,
};