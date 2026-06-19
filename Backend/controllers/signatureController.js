const Field = require("../models/Field");
const createAuditLog = require("../utils/createAuditLog");

// Save fields in bulk (placed by document creator)
const saveFieldsBulk = async (req, res) => {
  try {
    const { documentId, fields } = req.body;

    // Clear existing fields to overwrite
    await Field.deleteMany({ documentId });

    const createdFields = [];
    if (fields && fields.length > 0) {
      for (const field of fields) {
        const created = await Field.create({
          documentId,
          signerEmail: field.signerEmail,
          type: field.type,
          x: field.x,
          y: field.y,
          width: field.width,
          height: field.height,
          page: field.page,
          value: field.value || "",
          status: field.status || "Pending"
        });
        createdFields.push(created);
      }
    }

    await createAuditLog({
      documentId,
      userId: req.user._id,
      action: "FIELDS_PREPARED",
      details: `Placed ${createdFields.length} signing fields on document.`,
    });

    res.status(201).json(createdFields);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Retrieve all fields for a document
const getSignatures = async (req, res) => {
  try {
    const fields = await Field.find({
      documentId: req.params.documentId,
    });

    res.status(200).json(fields);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Save a single field (backward compatibility)
const saveSignature = async (req, res) => {
  try {
    const { documentId, x, y, page, signerEmail, type } = req.body;

    const field = await Field.create({
      documentId,
      signerEmail: signerEmail || req.user.email,
      type: type || "signature",
      x,
      y,
      width: req.body.width,
      height: req.body.height,
      page,
    });

    res.status(201).json(field);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Delete a placed field
const deleteField = async (req, res) => {
  try {
    const field = await Field.findByIdAndDelete(req.params.id);
    if (!field) {
      return res.status(404).json({ message: "Field not found" });
    }
    res.status(200).json({ message: "Field deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  saveFieldsBulk,
  getSignatures,
  saveSignature,
  deleteField,
};