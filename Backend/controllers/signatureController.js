const Signature = require("../models/Signature");
const createAuditLog = require("../utils/createAuditLog");

const saveSignature = async (req, res) => {
  try {
    const { documentId, x, y, page } = req.body;

    const signature = await Signature.create({
      documentId,
      signerId: req.user._id,
      x,
      y,
      page,
    });

    await createAuditLog({
      documentId,
      userId: req.user._id,
      action: "SIGNATURE_ADDED",
      details: `Signature added on page ${page}`,
    });

    res.status(201).json(signature);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getSignatures = async (req, res) => {
  try {
    const signatures = await Signature.find({
      documentId: req.params.documentId,
    });

    res.status(200).json(signatures);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  saveSignature,
  getSignatures,
};