import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import Navbar from "../components/Navbar";
import DashboardStats from "../components/DashboardStats";
import RecentActivity from "../components/RecentActivity";

function Dashboard() {
  const [documents, setDocuments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

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

  const generateLink = async (documentId) => {
    const email = prompt("Enter signer email:");

    if (!email) return;

    try {
      const res = await API.post("/email/generate-link", {
        documentId,
        email,
      });

      alert(`Signing Link:\n${res.data.signingLink}`);
    } catch (error) {
      console.log(error);
      alert("Failed to generate signing link");
    }
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "All" ? true : doc.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

 return (
  <>
    <Navbar />
    <DashboardStats />
    <RecentActivity />

    <div style={{ padding: "20px" }}>
      <h1
        style={{
          fontSize: "32px",
          marginBottom: "20px",
          fontWeight: "bold",
        }}>
        Document Dashboard
      </h1>

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px",
          flexWrap: "wrap",
        }}
      >
        <input
          type="text"
          placeholder="Search documents..."
          value={searchTerm}
          onChange={(e) =>
            setSearchTerm(e.target.value)
          }
          style={{
            padding: "10px",
            width: "300px",
            border: "1px solid #ccc",
            borderRadius: "6px",
            outline: "none",
          }}/>

        <select
          value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)
          }
          style={{
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "6px",
            cursor: "pointer",
            }}>

          <option value="All">All</option>
          <option value="Pending">Pending</option>
          <option value="Signed">Signed</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      <h2 style={{marginBottom: "20px",}}>
        My Documents
      </h2>

        <h1>My Documents</h1>

        {filteredDocuments.length === 0 ? (
          <p>No documents found</p>
        ) : (
          filteredDocuments.map((doc) => (
            <div
              key={doc._id}
              style={{
                background: "#fff",
                boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                padding: "20px",
                marginBottom: "15px",
                borderRadius: "12px",
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

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  marginTop: "10px",
                }}
              >
                <button
                  style={{
                    background: "#2563eb",
                    color: "white",
                    border: "none",
                    padding: "10px 15px",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                  onClick={() => navigate(`/document/${doc._id}`)}
                >
                  Open Document
                </button>

                <button
                  style={{
                    background: "#16a34a",
                    color: "white",
                    border: "none",
                    padding: "10px 15px",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                  onClick={() => generateLink(doc._id)}
                >
                  Generate Signing Link
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}

export default Dashboard;
