const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
  registerUser,
  loginUser,
  getUserProfile,
  generateUserApiKey,
  updateUserWebhookUrl,
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

// Developer profile and webhook settings
router.get("/profile", protect, getUserProfile);
router.post("/api-key", protect, generateUserApiKey);
router.post("/webhook-url", protect, updateUserWebhookUrl);

module.exports = router;