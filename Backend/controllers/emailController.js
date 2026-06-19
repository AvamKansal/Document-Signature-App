const { v4: uuidv4 } = require("uuid");
const createAuditLog = require("../utils/createAuditLog");
const Document = require("../models/Document");
const Field = require("../models/Field");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");
const triggerWebhook = require("../utils/triggerWebhook");

const getFrontendUrl = (req) => {
  const referer = req.headers.referer;
  if (referer) {
    try {
      const url = new URL(referer);
      return url.origin;
    } catch (e) {
      // ignore
    }
  }
  const origin = req.headers.origin;
  if (origin) {
    return origin;
  }
  return process.env.FRONTEND_URL || "http://localhost:5173";
};

const getDocumentByToken = async (req, res) => {
  try {
    const document = await Document.findOne({ "signers.signingToken": req.params.token });

    if (!document) {
      return res.status(404).json({ message: "Invalid signing link" });
    }

    const currentSigner = document.signers.find(s => s.signingToken === req.params.token);
    
    // Fetch all fields for this document
    const fields = await Field.find({ documentId: document._id });

    res.status(200).json({
      document,
      signer: currentSigner,
      fields
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const generateSigningLink = async (req, res) => {
  try {
    const { documentId, email, signers, webhookUrl } = req.body;

    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    let signerList = [];
    if (signers && signers.length > 0) {
      signerList = signers.map((s, index) => ({
        name: s.name,
        email: s.email,
        order: s.order !== undefined ? s.order : index + 1,
        status: "Pending",
        signingToken: index === 0 ? uuidv4() : ""
      }));
    } else if (email) {
      signerList = [{
        name: email.split("@")[0],
        email: email,
        order: 1,
        status: "Pending",
        signingToken: uuidv4()
      }];
    } else {
      return res.status(400).json({ message: "Please provide signers list or email" });
    }

    // Sort by order ascending
    signerList.sort((a, b) => a.order - b.order);

    // Make sure first signer has token
    if (signerList.length > 0 && !signerList[0].signingToken) {
      signerList[0].signingToken = uuidv4();
    }

    document.signers = signerList;
    document.currentSignerIndex = 0;
    document.status = "Pending";
    if (webhookUrl) {
      document.webhookUrl = webhookUrl;
    }
    await document.save();

    await createAuditLog({
      documentId: document._id,
      userId: req.user._id,
      action: "SIGN_REQUEST_INITIATED",
      details: `Signature workflow started with ${signerList.length} signers.`,
    });

    const firstSigner = signerList[0];
    const signingLink = `${getFrontendUrl(req)}/sign/${firstSigner.signingToken}`;
    
    await sendEmail({
      to: firstSigner.email,
      subject: `Signature Request: ${document.title}`,
      text: `Hello ${firstSigner.name || ""},\n\nYou have been requested to sign "${document.title}". Please click the link below to view and sign the document:\n\n${signingLink}\n\nThank you!`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #4f46e5; margin-top: 0;">Review & Sign Document</h2>
          <p>Hello <strong>${firstSigner.name || firstSigner.email}</strong>,</p>
          <p>You have been requested to sign the document: <strong>${document.title}</strong>.</p>
          <p>Please click the button below to view the document and place your signature:</p>
          <div style="margin: 30px 0; text-align: center;">
            <a href="${signingLink}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px rgba(79, 70, 229, 0.2);">Start Signing</a>
          </div>
          <p style="color: #666; font-size: 14px;">Or copy and paste this link in your browser:<br/><a href="${signingLink}" style="color: #4f46e5;">${signingLink}</a></p>
        </div>
      `
    });

    res.status(200).json({
      message: "Signing workflow initialized",
      signingLink,
      document
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const signDocumentByToken = async (req, res) => {
  try {
    const { token } = req.params;
    const { fieldValues, signaturePath, x, y, page } = req.body;

    const document = await Document.findOne({ "signers.signingToken": token });
    if (!document) {
      return res.status(404).json({ message: "Invalid signing link" });
    }

    const currentSigner = document.signers.find(s => s.signingToken === token);
    if (!currentSigner) {
      return res.status(404).json({ message: "Signer not found" });
    }

    // Save field values
    if (fieldValues && fieldValues.length > 0) {
      for (const fVal of fieldValues) {
        await Field.findByIdAndUpdate(fVal.id, {
          value: fVal.value,
          status: "Filled"
        });
      }
    } else if (signaturePath) {
      // Backward compatibility / click-to-sign on unprepared doc
      await Field.create({
        documentId: document._id,
        signerEmail: currentSigner.email,
        type: "signature",
        x: x || 50,
        y: y || 80,
        page: page || 1,
        value: signaturePath,
        status: "Filled"
      });
    }

    // Mark current signer as Signed
    currentSigner.status = "Signed";
    currentSigner.signedAt = new Date();

    await createAuditLog({
      documentId: document._id,
      action: "DOCUMENT_SIGNED",
      details: `${currentSigner.email} signed the document.`,
    });

    // Check next signer
    const nextSignerIndex = document.currentSignerIndex + 1;
    if (nextSignerIndex < document.signers.length) {
      document.currentSignerIndex = nextSignerIndex;
      const nextSigner = document.signers[nextSignerIndex];
      nextSigner.signingToken = uuidv4();
      await document.save();

      const signingLink = `${getFrontendUrl(req)}/sign/${nextSigner.signingToken}`;
      await sendEmail({
        to: nextSigner.email,
        subject: `Signature Request: ${document.title}`,
        text: `Hello ${nextSigner.name || ""},\n\nYou have been requested to sign "${document.title}". Please click the link below to view and sign the document:\n\n${signingLink}\n\nThank you!`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #4f46e5; margin-top: 0;">Review & Sign Document</h2>
            <p>Hello <strong>${nextSigner.name || nextSigner.email}</strong>,</p>
            <p>You have been requested to sign the document: <strong>${document.title}</strong>.</p>
            <p>Please click the button below to view the document and place your signature:</p>
            <div style="margin: 30px 0; text-align: center;">
              <a href="${signingLink}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px rgba(79, 70, 229, 0.2);">Start Signing</a>
            </div>
            <p style="color: #666; font-size: 14px;">Or copy and paste this link in your browser:<br/><a href="${signingLink}" style="color: #4f46e5;">${signingLink}</a></p>
          </div>
        `
      });

      res.status(200).json({
        message: "Signed successfully. Next signer has been notified.",
        nextSigner: true,
        document
      });
    } else {
      // Document is fully signed!
      document.status = "Signed";
      await document.save();

      // Trigger Webhook callbacks
      await triggerWebhook(document, "document.signed");

      // Notify the owner
      const owner = await User.findById(document.uploadedBy);
      if (owner) {
        await sendEmail({
          to: owner.email,
          subject: `Document Fully Signed: ${document.title}`,
          text: `Hello ${owner.name},\n\nYour document "${document.title}" has been fully signed by all parties. You can download the completed PDF from your dashboard.\n\nThank you!`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
              <h2 style="color: #10b981; margin-top: 0;">Signing Workflow Completed!</h2>
              <p>Hello <strong>${owner.name}</strong>,</p>
              <p>Your document <strong>${document.title}</strong> has been fully signed by all parties.</p>
              <p>You can view the signing details, audit logs, and download the secure signed PDF directly from your dashboard.</p>
            </div>
          `
        });
      }

      res.status(200).json({
        message: "Document fully signed by all parties.",
        nextSigner: false,
        document
      });
    }
  } catch (error) {
    res.status(550).json({ message: error.message });
  }
};

module.exports = { getDocumentByToken, generateSigningLink, signDocumentByToken };