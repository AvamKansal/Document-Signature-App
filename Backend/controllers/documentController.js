const Document = require("../models/Document");
const Field = require("../models/Field");
const createAuditLog = require("../utils/createAuditLog");
const { generateSigningLink } = require("./emailController");

// Upload Document
const uploadDocument = async (req, res) => {
  try {
    const document = await Document.create({
      title: req.body.title,
      fileName: req.file.filename,
      filePath: req.file.path.replace(/\\/g, "/"),
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

const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      uploadedBy: req.user._id,
    });

    if (!document) {
      return res.status(404).json({
        message: "Document not found",
      });
    }

    await Document.findByIdAndDelete(req.params.id);
    // Delete associated fields
    await Field.deleteMany({ documentId: req.params.id });

    res.status(200).json({
      message: "Document deleted successfully",
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

const getDashboardStats = async (req, res) => {
  try {
    const documents = await Document.find({
      uploadedBy: req.user._id,
      isTemplate: false // Don't count templates in dashboard stats
    });

    const totalDocuments = documents.length;

    const signedDocuments = documents.filter(
      (doc) => doc.status === "Signed",
    ).length;

    const pendingDocuments = documents.filter(
      (doc) => doc.status === "Pending",
    ).length;

    res.status(200).json({
      totalDocuments,
      signedDocuments,
      pendingDocuments,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Reusable Templates Instantiator
const useTemplate = async (req, res, next) => {
  try {
    const { templateId, signers } = req.body;

    const template = await Document.findById(templateId);
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    // Create a new signing document cloned from the template PDF
    const newDoc = await Document.create({
      title: `${template.title} - ${new Date().toLocaleDateString()}`,
      fileName: template.fileName,
      filePath: template.filePath,
      uploadedBy: req.user._id,
      isTemplate: false,
      status: "Pending"
    });

    // Fetch original template placed fields
    const templateFields = await Field.find({ documentId: templateId });

    // Map template roles placeholder emails to new signer emails in sequential order
    const emailMap = {};
    template.signers.forEach((s, idx) => {
      if (signers[idx]) {
        emailMap[s.email] = signers[idx].email;
      }
    });

    // Clone fields
    for (const tField of templateFields) {
      const targetEmail = emailMap[tField.signerEmail] || signers[0]?.email;
      await Field.create({
        documentId: newDoc._id,
        signerEmail: targetEmail,
        type: tField.type,
        x: tField.x,
        y: tField.y,
        page: tField.page,
        status: "Pending"
      });
    }

    // Pass details forward to create email signing workflow
    req.body.documentId = newDoc._id;
    req.body.signers = signers;
    
    // Call generateSigningLink
    generateSigningLink(req, res, next);
  } catch (error) {
    res.status(550).json({ message: error.message });
  }
};

module.exports = {
  uploadDocument,
  getDocuments,
  getDashboardStats,
  deleteDocument,
  useTemplate
};
