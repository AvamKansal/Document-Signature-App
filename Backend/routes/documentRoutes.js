const express = require("express");

const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const {
  uploadDocument,
  getDocuments,
} = require("../controllers/documentController");

const router = express.Router();

router.post(
  "/upload",
  protect,
  upload.single("pdf"),
  uploadDocument
);

router.get("/", protect, getDocuments);

module.exports = router;