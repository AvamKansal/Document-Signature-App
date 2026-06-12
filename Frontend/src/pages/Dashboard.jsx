import { useEffect, useState } from "react";
import API from "../services/api";
import Navbar from "../components/Navbar";

function Dashboard() {
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await API.get("/docs");
      setDocuments(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <Navbar />

      <div style={{ padding: "20px" }}>
        <h1>My Documents</h1>

        {documents.map((doc) => (
          <div
            key={doc._id}
            style={{
              border: "1px solid #ccc",
              padding: "10px",
              marginBottom: "10px",
            }}
          >
            <h3>{doc.title}</h3>

            <p>Status: {doc.status}</p>

            <button
              onClick={() =>
                window.open(
                  `http://localhost:5000/${doc.filePath}`,
                  "_blank"
                )
              }
            >
              View PDF
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

export default Dashboard;