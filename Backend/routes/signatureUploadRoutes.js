const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/signatures";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },

  filename: (req, file, cb) => {
    cb(
      null,
      Date.now() +
      path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage });

router.post(
  "/",
  upload.single("signature"),
  (req, res) => {
    res.json({
      path: req.file.path.replace(/\\/g, "/"),
    });
  }
);

module.exports = router;