const express = require("express");
const protect = require("../middleware/authMiddleware");

const {
  saveSignature,
  getSignatures,
  saveFieldsBulk,
  deleteField,
} = require("../controllers/signatureController");

const router = express.Router();

router.post("/", protect, saveSignature);
router.get("/:documentId", protect, getSignatures);

// Bulk edit and single field deletion
router.post("/bulk", protect, saveFieldsBulk);
router.delete("/fields/:id", protect, deleteField);

module.exports = router;