const axios = require("axios");
const createAuditLog = require("./createAuditLog");

const triggerWebhook = async (document, event) => {
  const url = document.webhookUrl;
  if (!url) return;

  const payload = {
    event,
    documentId: document._id,
    title: document.title,
    status: document.status,
    updatedAt: document.updatedAt,
    signers: document.signers.map(s => ({
      name: s.name,
      email: s.email,
      status: s.status,
      signedAt: s.signedAt
    }))
  };

  try {
    console.log(`[Webhook Trigger] Sending event ${event} to ${url}`);
    axios.post(url, payload, { timeout: 5000 })
      .then((res) => {
        console.log(`[Webhook Success] Received status ${res.status} from ${url}`);
      })
      .catch((err) => {
        console.error(`[Webhook Failure] Failed sending to ${url}:`, err.message);
      });
  } catch (error) {
    console.error(`[Webhook Error] Failed to trigger:`, error.message);
  }
};

module.exports = triggerWebhook;
