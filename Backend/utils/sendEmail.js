const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    // Check if SMTP environment variables are present
    const hasSmtp =
      process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS;

    if (hasSmtp) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT),
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.SMTP_FROM || `"E-Sign Platform" <no-reply@e-sign-platform.com>`,
        to,
        subject,
        text,
        html,
      });

      console.log(`[SMTP Email] Sent to ${to}: ${subject}`);
    } else {
      // Log to console and a local test file
      const logDir = path.join(__dirname, "..", "uploads");
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }

      const logPath = path.join(logDir, "emails.log");
      const emailRecord = `
=============================================
DATE: ${new Date().toISOString()}
TO: ${to}
SUBJECT: ${subject}
TEXT: ${text}
HTML Preview:
${html}
=============================================
`;

      fs.appendFileSync(logPath, emailRecord);
      console.log(`[Log Email] Logged to uploads/emails.log (Target: ${to}, Subject: ${subject})`);
    }
    return true;
  } catch (error) {
    console.error("Email send failed:", error);
    return false;
  }
};

module.exports = sendEmail;
