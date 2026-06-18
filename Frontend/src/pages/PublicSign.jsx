import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";
import PdfViewer from "../components/PdfViewer";
import TypeSignatureModal from "../components/TypeSignatureModal";

function PublicSign() {
  const { token } = useParams();

  const [document, setDocument] = useState(null);
  
  // New state for click-to-sign
  const [modalOpen, setModalOpen] = useState(false);
  const [clickCoords, setClickCoords] = useState({ x: 0, y: 0, page: 1 });

  useEffect(() => {
    fetchDocument();
  }, []);

  const fetchDocument = async () => {
    try {
      const res = await API.get(
        `/email/document/${token}`
      );

      setDocument(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handlePdfClick = (x, y, page) => {
    if (document?.status === "Signed") return;
    setClickCoords({ x, y, page });
    setModalOpen(true);
  };

  const handleSaveSignature = async (signaturePath) => {
    setModalOpen(false);
    try {
      await API.post(`/email/document/${token}/sign`, { 
        signaturePath,
        x: clickCoords.x,
        y: clickCoords.y,
        page: clickCoords.page
      });
      alert("Document signed successfully!");
      fetchDocument();
    } catch (error) {
      console.log(error);
      alert("Failed to sign document.");
    }
  };

  if (!document) {
    return <h2>Loading...</h2>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Public Signing</h1>

      <h2>{document.title}</h2>

      <p>Status: {document.status}</p>

      {document.status !== "Signed" && (
        <div style={{ marginBottom: "15px", padding: "10px", background: "#fff3cd", border: "1px solid #ffeeba", borderRadius: "5px", color: "#856404" }}>
          <strong>Instructions:</strong> Click anywhere on the document below where you would like to place your signature.
        </div>
      )}

      <PdfViewer
        fileUrl={`http://localhost:5000/${document.filePath?.replace(/\\/g, '/')}`}
        onPdfClick={handlePdfClick}
      />

      {modalOpen && (
        <TypeSignatureModal
          x={clickCoords.x}
          y={clickCoords.y}
          page={clickCoords.page}
          onClose={() => setModalOpen(false)}
          onSave={handleSaveSignature}
        />
      )}
    </div>
  );
}

export default PublicSign;