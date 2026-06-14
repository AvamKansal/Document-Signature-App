const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");
const documentRoutes = require("./routes/documentRoutes");
const signatureRoutes = require("./routes/signatureRoutes");
const pdfRoutes = require("./routes/pdfRoutes");
const connectDB = require("./config/db");
const signatureUploadRoutes =require("./routes/signatureUploadRoutes");
const emailRoutes = require("./routes/emailRoutes");

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/docs", documentRoutes);
app.use("/api/auth", authRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/signatures", signatureRoutes);
app.use("/api/pdf",pdfRoutes);
app.use("/api/signature-upload",signatureUploadRoutes);
app.use("/api/email",emailRoutes);


app.get("/", (req, res) => {
  res.send("API Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});