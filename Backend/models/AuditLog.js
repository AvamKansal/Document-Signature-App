const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    action: {
      type: String,
      required: true,
    },

    details: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "AuditLog",
  auditLogSchema
);