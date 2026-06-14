import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import Navbar from "../components/Navbar";

function Dashboard() {
  const [documents, setDocuments] = useState([]);
  const navigate = useNavigate();

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

        {documents.length === 0 ? (
          <p>No documents found</p>
        ) : (
          documents.map((doc) => (
            <div
              key={doc._id}
              style={{
                border: "1px solid #ccc",
                padding: "15px",
                marginBottom: "15px",
                borderRadius: "8px",
              }}
            >
              <h3>{doc.title}</h3>

<p>
  <strong>Status:</strong>{" "}
  <span
    style={{
      color:
        doc.status === "Signed"
          ? "green"
          : doc.status === "Rejected"
          ? "red"
          : "orange",
      fontWeight: "bold",
    }}
  >
    {doc.status}
  </span>
</p>

              <button
                onClick={() =>
                  navigate(`/document/${doc._id}`)
                }
              >
                Open Document
              </button>
            </div>
          ))
        )}
      </div>
    </>
  );
}

export default Dashboard;