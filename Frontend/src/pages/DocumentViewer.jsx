import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";
import PdfViewer from "../components/PdfViewer";

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

  const generatePdf = async () => {
    try {
      const res = await API.get(
        `/pdf/generate/${id}`
      );

      alert("Signed PDF Generated!");

      console.log(res.data);
    } catch (error) {
      console.log(error);
      alert("Failed to generate PDF");
    }
  };

  if (!document) {
    return <h2>Loading...</h2>;
  }

  return (
    <div>
      <h1>{document.title}</h1>

      <button
        onClick={generatePdf}
        style={{
          padding: "10px 20px",
          marginBottom: "20px",
          cursor: "pointer",
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
    </div>
  );
}

export default DocumentViewer;