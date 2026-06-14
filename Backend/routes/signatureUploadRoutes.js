const express = require("express");
const multer = require("multer");
const path = require("path");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/signatures");
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
      path: req.file.path,
    });
  }
);

module.exports = router;