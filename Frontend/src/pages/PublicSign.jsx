import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";
import PdfViewer from "../components/PdfViewer";

function PublicSign() {
  const { token } = useParams();

  const [document, setDocument] = useState(null);

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

  if (!document) {
    return <h2>Loading...</h2>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Public Signing</h1>

      <h2>{document.title}</h2>

      <p>Status: {document.status}</p>

      <PdfViewer
        fileUrl={`http://localhost:5000/${document.filePath}`}
      />
    </div>
  );
}

export default PublicSign;