const AuditLog = require("../models/AuditLog");

const createAuditLog = async ({
  documentId,
  userId,
  action,
  details,
}) => {
  try {
    await AuditLog.create({
      documentId,
      userId,
      action,
      details,
    });
  } catch (error) {
    console.log(
      "Audit Log Error:",
      error.message
    );
  }
};

module.exports = createAuditLog;