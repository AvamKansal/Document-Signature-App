const mongoose = require("mongoose");

const signatureSchema = new mongoose.Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
    },

    signerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    
    signatureImage: {
      type: String,
    },

    page: {
      type: Number,
      default: 1,
    },

    x: {
      type: Number,
      required: true,
    },

    y: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["Pending", "Signed"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Signature", signatureSchema);