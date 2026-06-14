const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
  generateSigningLink,
} = require("../controllers/emailController");

const router = express.Router();

router.post(
  "/generate-link",
  protect,
  generateSigningLink
);

module.exports = router;