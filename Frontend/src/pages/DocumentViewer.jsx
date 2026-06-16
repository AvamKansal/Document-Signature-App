import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import API from "../services/api";

function DocumentViewer() {
  const { id } = useParams();

  const [document, setDocument] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocument();
  }, []);

  // Fetch document details
  const fetchDocument = async () => {
    try {
      const docsRes = await API.get("/docs");

      const selectedDoc = docsRes.data.find((doc) => doc._id === id);

      setDocument(selectedDoc);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <h2>Loading...</h2>;
  }

  if (!document) {
    return <h2>Document not found</h2>;
  }

  return (
    <>
      <Navbar />

      <div
        style={{
          padding: "20px",
          display: "grid",
          gridTemplateColumns: "1fr 2fr",
          gap: "20px",
        }}
      >
        {/* Document Information */}
        <div
          style={{
            background: "#fff",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          }}
        >
          <h2>Document Details</h2>

          <p>
            <strong>Title:</strong> {document.title}
          </p>

          <p>
            <strong>Status:</strong> {document.status}
          </p>

          <p>
            <strong>Signer Email:</strong>{" "}
            {document.signerEmail || "Not Assigned"}
          </p>

          <p>
            <strong>Uploaded:</strong>{" "}
            {new Date(document.createdAt).toLocaleString()}
          </p>
        </div>

        {/* PDF Viewer */}
        <div
          style={{
            background: "#fff",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          }}
        >
          <h2>PDF Preview</h2>

          <iframe
            src={`http://localhost:5000/${document.filePath}`}
            title="PDF Viewer"
            width="100%"
            height="700px"
            style={{
              border: "none",
            }}
          />
        </div>
      </div>
    </>
  );
}

export default DocumentViewer;