const express = require("express");
const Document = require("../models/Document");
const Field = require("../models/Field");
const apiProtect = require("../middleware/apiAuthMiddleware");
const upload = require("../middleware/uploadMiddleware");
const { generateSigningLink } = require("../controllers/emailController");

const router = express.Router();

// 1. Upload PDF document programmatically
router.post(
  "/docs/upload",
  apiProtect,
  upload.single("pdf"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No PDF file uploaded. Please upload a file with key 'pdf'." });
      }

      const document = await Document.create({
        title: req.body.title || req.file.originalname,
        fileName: req.file.filename,
        filePath: req.file.path.replace(/\\/g, "/"),
        uploadedBy: req.user._id,
      });

      res.status(201).json({
        message: "Document uploaded successfully via REST API",
        documentId: document._id,
        document,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// 2. Initiate signature request (sends invitation email to first signer)
router.post("/docs/:id/send", apiProtect, (req, res, next) => {
  req.body.documentId = req.params.id;
  // Forward to emailController's generateSigningLink endpoint
  generateSigningLink(req, res, next);
});

// 3. Retrieve document status and signer progression
router.get("/docs/:id", apiProtect, async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      uploadedBy: req.user._id,
    });

    if (!document) {
      return res.status(404).json({ message: "Document not found or access denied." });
    }

    res.status(200).json(document);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 4. Retrieve data inputs entered by signers
router.get("/docs/:id/data", apiProtect, async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      uploadedBy: req.user._id,
    });

    if (!document) {
      return res.status(404).json({ message: "Document not found or access denied." });
    }

    const fields = await Field.find({ documentId: document._id });

    res.status(200).json({
      documentId: document._id,
      title: document.title,
      status: document.status,
      signers: document.signers.map((s) => ({
        name: s.name,
        email: s.email,
        status: s.status,
        signedAt: s.signedAt,
      })),
      fieldData: fields.map((f) => ({
        id: f._id,
        type: f.type,
        signerEmail: f.signerEmail,
        page: f.page,
        coordinates: { x: f.x, y: f.y },
        value: f.value,
        status: f.status,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
