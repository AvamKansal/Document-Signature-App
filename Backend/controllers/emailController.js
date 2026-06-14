const { v4: uuidv4 } = require("uuid");

const Document = require("../models/Document");

const generateSigningLink = async (
  req,
  res
) => {
  try {
    const { documentId, email } =
      req.body;

    const token = uuidv4();

    const document =
      await Document.findByIdAndUpdate(
        documentId,
        {
          signingToken: token,
          signerEmail: email,
        },
        { new: true }
      );

    const signingLink =
      `http://localhost:5173/sign/${token}`;

    res.status(200).json({
      message:
        "Signing link created",
      signingLink,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  generateSigningLink,
};