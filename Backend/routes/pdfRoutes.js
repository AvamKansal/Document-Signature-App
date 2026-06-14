const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
  generateSignedPdf,
} = require("../controllers/pdfController");

const router = express.Router();

router.get(
  "/generate/:documentId",
  protect,
  generateSignedPdf
);

module.exports = router;