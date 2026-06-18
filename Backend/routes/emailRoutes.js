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

router.post(
  "/document/:token/sign",
  require("../controllers/emailController").signDocumentByToken
);

module.exports = router;