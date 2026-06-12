const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
  saveSignature,
  getSignatures,
} = require("../controllers/signatureController");

const router = express.Router();

router.post("/", protect, saveSignature);

router.get("/:documentId", protect, getSignatures);

module.exports = router;