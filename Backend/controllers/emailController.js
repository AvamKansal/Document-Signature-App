const { v4: uuidv4 } = require("uuid");
const createAuditLog = require("../utils/createAuditLog");
const Document = require("../models/Document");
const Signature = require("../models/Signature");

const getDocumentByToken = async (req,res) => {
  try {
    const document = await Document.findOne({signingToken: req.params.token,});

    if (!document) {
      return res.status(404).json({message: "Invalid signing link",});
    }

    res.status(200).json(document);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const generateSigningLink = async (req,res) => {
  try {
    const { documentId, email } = req.body;
    const token = uuidv4();

const document = await Document.findByIdAndUpdate(documentId,{signingToken: token,signerEmail: email,},
    { new: true }
  );

await createAuditLog({
  documentId: document._id,
  userId: req.user._id,
  action: "SIGN_LINK_GENERATED",
  details: `Signing link generated for ${email}`,
});

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

const signDocumentByToken = async (req, res) => {
  try {
    const { signaturePath, x, y, page } = req.body;
    const document = await Document.findOne({ signingToken: req.params.token });
    
    if (!document) {
      return res.status(404).json({ message: "Invalid signing link" });
    }

    document.status = "Signed";
    await document.save();

    if (signaturePath) {
      await Signature.create({
        documentId: document._id,
        signerId: document.uploadedBy,
        signatureImage: signaturePath,
        x: x || 50,
        y: y || 80,
        page: page || 1,
        status: "Signed"
      });
    }

    res.status(200).json({ message: "Document signed successfully", document });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {generateSigningLink,getDocumentByToken, signDocumentByToken};