import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";
import PdfViewer from "../components/PdfViewer";
import AuditHistory from "../components/AuditHistory";

function DocumentViewer() {
  const { id } = useParams();

  const [document, setDocument] = useState(null);
  const [signatures, setSignatures] = useState([]);

  useEffect(() => {
    fetchDocument();
    fetchSignatures();
  }, []);

  const fetchDocument = async () => {
    try {
      const res = await API.get("/docs");

      const selectedDoc = res.data.find(
        (doc) => doc._id === id
      );

      setDocument(selectedDoc);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchSignatures = async () => {
    try {
      const res = await API.get(`/signatures/${id}`);
      setSignatures(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const generatePdf = () => {
    window.open(
      `http://localhost:5000/api/pdf/generate/${id}`,
      "_blank"
    );
  };

  if (!document) {
    return <h2>Loading...</h2>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>{document.title}</h1>

      <button
        onClick={generatePdf}
        style={{
          padding: "10px 20px",
          marginBottom: "20px",
          cursor: "pointer",
          borderRadius: "5px",
        }}
      >
        Generate Signed PDF
      </button>

      <PdfViewer
        fileUrl={`http://localhost:5000/${document.filePath}`}
        signatures={signatures}
        documentId={id}
        refreshSignatures={fetchSignatures}
      />
      <AuditHistory documentId={id} />
    </div>
  );
}

export default DocumentViewer;