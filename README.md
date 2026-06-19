# ✍️ E-SignHub - Secure Document Signature Application

## 📌 Overview

E-SignHub is a full-stack MERN-based document signing application that enables users to securely upload, manage, share, and digitally sign PDF documents online.

The platform provides a streamlined document workflow where users can upload documents, generate secure signing links, track document status, maintain audit logs, and download signed PDFs.

Built using React, Node.js, Express, MongoDB, and PDF-Lib, E-SignHub demonstrates modern full-stack development practices and secure document management workflows.

---

# 🚀 Features

## Authentication & Security

* User Registration
* User Login
* JWT Authentication
* Protected Routes
* Secure API Authorization

## Document Management

* Upload PDF Documents
* View Uploaded Documents
* Search Documents
* Filter Documents by Status
* Delete Documents
* Download Documents

## Digital Signature Workflow

* Generate Secure Signing Links
* Public Signing Pages
* Store Signature Coordinates
* Signature Tracking
* Status Management (Pending / Signed / Rejected)

## Audit & Monitoring

* Audit Log Tracking
* Recent Activity Dashboard
* Document Statistics Dashboard

## User Experience

* Responsive Dashboard
* User Profile Page
* Real-Time Status Updates
* Clean and Simple UI

---

# 🛠️ Tech Stack

## Frontend

* React.js
* Vite
* React Router DOM
* Axios
* JavaScript
* CSS

## Backend

* Node.js
* Express.js
* MongoDB Atlas
* Mongoose
* JWT Authentication
* Multer

## PDF Processing

* PDF-Lib

## Deployment

* Vercel (Frontend)
* Render (Backend)

---

# 📂 Project Structure

```text
Document-Signature-App/
│
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── DashboardStats.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── RecentActivity.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── PublicSign.jsx
│   │   │   └── DocumentViewer.jsx
│   │   │
│   │   ├── services/
│   │   │   └── api.js
│   │   │
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── .env
│
├── Backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   ├── utils/
│   ├── server.js
│   ├── package.json
│   └── .env
│
└── README.md
```

---

# ⚙️ Installation

## 1. Clone Repository

```bash
git clone https://github.com/AvamKansal/Document-Signature-App.git

cd Document-Signature-App
```

---

# Backend Setup

## Install Dependencies

```bash
cd Backend

npm install
```

## Create .env File

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret
```

## Start Backend

```bash
npm run dev
```

Server runs on:

```text
http://localhost:5000
```

---

# Frontend Setup

## Install Dependencies

```bash
cd Frontend

npm install
```

## Start Frontend

```bash
npm run dev
```

Application runs on:

```text
http://localhost:5173
```

---

# 🔌 API Endpoints

## Authentication

### Register User

```http
POST /api/auth/register
```

Request:

```json
{
  "name": "Avam",
  "email": "avam@test.com",
  "password": "123456"
}
```

---

### Login User

```http
POST /api/auth/login
```

Request:

```json
{
  "email": "avam@test.com",
  "password": "123456"
}
```

---

## Documents

### Upload Document

```http
POST /api/docs/upload
```

Content-Type:

```text
multipart/form-data
```

Fields:

```text
pdf
title
```

---

### Fetch Documents

```http
GET /api/docs
```

---

### Delete Document

```http
DELETE /api/docs/:id
```

---

## Signing Workflow

### Generate Signing Link

```http
POST /api/email/generate-link
```

Request:

```json
{
  "documentId": "document_id",
  "email": "signer@email.com"
}
```

---

### Open Public Signing Page

```http
GET /api/email/document/:token
```

---

## Signatures

### Save Signature

```http
POST /api/signatures
```

Request:

```json
{
  "documentId": "document_id",
  "x": 45,
  "y": 60,
  "page": 1
}
```

---

### Get Signatures

```http
GET /api/signatures/:documentId
```

---

## PDF Generation

### Generate Signed PDF

```http
GET /api/pdf/generate/:documentId
```

---

## Audit Logs

### Fetch Audit Logs

```http
GET /api/audit/:documentId
```

---

# 🌐 Deployment

## Frontend (Vercel)

Build Command

```bash
npm run build
```

Output Directory

```text
dist
```

Deploy Frontend using:

```bash
vercel
```

---

## Backend (Render)

Environment Variables

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret
```

Deploy Backend using:

* Render
* Railway
* VPS

---

# 🔒 Security Notes

* JWT Authentication secures protected routes.
* Passwords are encrypted using bcrypt.
* Signing links use unique UUID tokens.
* Sensitive information is stored in environment variables.
* API routes are protected with authentication middleware.

---

# 📈 Future Improvements

* Email Notifications with Nodemailer
* Real Signature Canvas
* Multi-Signer Workflow
* PDF Field Placement Editor
* Cloud Storage Integration (AWS S3)
* Role-Based Access Control
* Real-Time Collaboration

---

# 👨‍💻 Author

**Avam Kansal**

GitHub:
https://github.com/AvamKansal

---

# 📄 License

This project is licensed under the MIT License.
