const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    fileName: {
      type: String,
      required: true,
    },

    filePath: {
      type: String,
      required: true,
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Multiple signers with signing order sequence
    signers: [
      {
        name: { type: String },
        email: { type: String, required: true },
        order: { type: Number, default: 0 },
        status: {
          type: String,
          enum: ["Pending", "Signed", "Rejected"],
          default: "Pending",
        },
        signingToken: { type: String },
        signedAt: { type: Date },
      },
    ],

    currentSignerIndex: {
      type: Number,
      default: 0,
    },

    webhookUrl: {
      type: String,
    },

    isTemplate: {
      type: Boolean,
      default: false,
    },

    templateFields: [
      {
        type: {
          type: String,
          enum: ["signature", "initials", "text", "date", "checkbox"],
        },
        x: { type: Number },
        y: { type: Number },
        page: { type: Number },
        roleIndex: { type: Number }, // Index of the signer role (e.g. 0 for 1st signer, 1 for 2nd)
      },
    ],

    status: {
      type: String,
      enum: ["Pending", "Signed", "Rejected"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Document", documentSchema);