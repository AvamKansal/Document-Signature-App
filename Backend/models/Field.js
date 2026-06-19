const mongoose = require("mongoose");

const fieldSchema = new mongoose.Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
    },

    signerEmail: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: ["signature", "initials", "text", "date", "checkbox"],
      default: "signature",
    },

    x: {
      type: Number,
      required: true, // Percentage value (0 - 100)
    },

    y: {
      type: Number,
      required: true, // Percentage value (0 - 100)
    },

    // Custom dimensions (stored as percentage of page width/height)
    width: {
      type: Number,
      default: 15, // default width percentage
    },

    height: {
      type: Number,
      default: 5, // default height percentage
    },

    page: {
      type: Number,
      default: 1,
    },

    value: {
      type: String, // Path to signature PNG image, raw text, date string, or checkbox boolean string
      default: "",
    },

    status: {
      type: String,
      enum: ["Pending", "Filled"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Field", fieldSchema);
