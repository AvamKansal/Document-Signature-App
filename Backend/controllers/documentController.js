const Document = require("../models/Document");
const createAuditLog = require("../utils/createAuditLog");

// Upload Document
const uploadDocument = async (req, res) => {
  try {
    const document = await Document.create({
      title: req.body.title,
      fileName: req.file.filename,
      filePath: req.file.path,
      uploadedBy: req.user._id,
    });

    await createAuditLog({
  documentId: document._id,
  userId: req.user._id,
  action: "DOCUMENT_UPLOADED",
  details: `${document.title} uploaded`,
});

    res.status(201).json({
      message: "Document uploaded successfully",
      document,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get All Documents Uploaded By Logged-in User
const getDocuments = async (req, res) => {
  try {
    const documents = await Document.find({
      uploadedBy: req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json(documents);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  uploadDocument,
  getDocuments,
};