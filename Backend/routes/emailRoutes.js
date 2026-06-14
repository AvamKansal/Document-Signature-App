const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
  generateSigningLink,
  getDocumentByToken,
} = require("../controllers/emailController");

const router = express.Router();

router.post(
  "/generate-link",
  protect,
  generateSigningLink
);

router.get(
  "/document/:token",
  getDocumentByToken
);

module.exports = router;