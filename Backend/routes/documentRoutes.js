const express = require("express");

const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const {
  uploadDocument,
  getDocuments,
  getDashboardStats,
  deleteDocument,
} = require("../controllers/documentController");

const router = express.Router();
router.get("/stats", protect, getDashboardStats);
router.get("/", protect, getDocuments);

router.delete("/:id", protect, deleteDocument);
router.post("/upload", protect, upload.single("pdf"), uploadDocument);

module.exports = router;
