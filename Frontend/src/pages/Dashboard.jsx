// Dashboard data and filter states
const [documents, setDocuments] = useState([]);
const [searchTerm, setSearchTerm] = useState("");
const [statusFilter, setStatusFilter] = useState("All");
const user = JSON.parse(localStorage.getItem("user"));

// Stores generated signing links for quick access
const [generatedLinks, setGeneratedLinks] = useState({});

// Load user documents when dashboard opens
useEffect(() => {
  fetchDocuments();
}, []);

// Fetch all documents uploaded by the logged-in user
const fetchDocuments = async () => {
  try {
    const res = await API.get("/docs");
    setDocuments(res.data);
  } catch (error) {
    console.log(error);
  }
};

// Generate a public signing link for a document
const generateLink = async (documentId) => {
  const email = prompt("Enter signer email:");

  if (!email) return;

  try {
    const res = await API.post("/email/generate-link", {
      documentId,
      email,
    });

    setGeneratedLinks((prev) => ({
      ...prev,
      [documentId]: res.data.signingLink,
    }));

    alert("Signing link generated successfully");
  } catch (error) {
    console.log(error);
    alert("Failed to generate signing link");
  }
};

// Copy signing link to clipboard
const copyLink = (link) => {
  navigator.clipboard.writeText(link);
  alert("Link copied to clipboard");
};

// Delete a document after user confirmation
const deleteDocument = async (documentId) => {
  const confirmDelete = window.confirm(
    "Are you sure you want to delete this document?",
  );

  if (!confirmDelete) return;

  try {
    await API.delete(`/docs/${documentId}`);

    alert("Document deleted successfully");

    fetchDocuments();
  } catch (error) {
    console.log(error);

    alert("Failed to delete document");
  }
};

// Apply search and status filters
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

    {/* Dashboard Content */}
    <div style={{ padding: "20px" }}>
      {/* Dashboard Header */}
      <h1
        style={{
          fontSize: "32px",
          marginBottom: "20px",
          fontWeight: "bold",
        }}
      >
        Document Dashboard
      </h1>
      <p
        style={{
          color: "#666",
          marginBottom: "20px",
        }}
      >
        Welcome back,
        <strong> {user?.name}</strong>
      </p>

      {/* Upload New Document */}
      <button
        onClick={() => navigate("/upload")}
        style={{
          background: "#2563eb",
          color: "white",
          border: "none",
          padding: "10px 20px",
          borderRadius: "6px",
          cursor: "pointer",
          marginBottom: "20px",
        }}
      >
        Upload New Document
      </button>

      {/* Search and Filter Controls */}
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
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: "10px",
            width: "300px",
            border: "1px solid #ccc",
            borderRadius: "6px",
          }}
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: "10px",
            borderRadius: "6px",
          }}
        >
          <option value="All">All</option>
          <option value="Pending">Pending</option>
          <option value="Signed">Signed</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      <h2
        style={{
          marginBottom: "20px",
        }}
      >
        My Documents
      </h2>

      {/* Documents List */}
      {filteredDocuments.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "40px",
            background: "#fff",
            borderRadius: "12px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          }}
        >
          <h2>No Documents Found</h2>

          <p>Upload your first document to get started.</p>

          <button
            onClick={() => navigate("/upload")}
            style={{
              background: "#2563eb",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "6px",
              cursor: "pointer",
              marginTop: "10px",
            }}
          >
            Upload Document
          </button>
        </div>
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

            {/* Document Actions */}
            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
                marginTop: "10px",
              }}
            >
              <button>Open Document</button>

              <button>Generate Signing Link</button>

              <button>Copy Link</button>

              <button>Download PDF</button>

              <button>Delete</button>
            </div>
          </div>
        ))
      )}
    </div>
  </>
);
