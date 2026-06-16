const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
  getAuditLogs,
} = require("../controllers/auditController");

const router = express.Router();

router.get(
  "/:documentId",
  protect,
  getAuditLogs
);

module.exports = router;