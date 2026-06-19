import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import Navbar from "../components/Navbar";
import DashboardStats from "../components/DashboardStats";
import RecentActivity from "../components/RecentActivity";
import { FiPlus, FiSearch, FiFilter, FiFileText, FiLink, FiDownload, FiTrash2, FiEye, FiCheckCircle, FiClock, FiXCircle } from "react-icons/fi";

function Dashboard() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const user = JSON.parse(localStorage.getItem("user"));

  const [generatedLinks, setGeneratedLinks] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await API.get("/docs");
      // Exclude templates from main dashboard document lists
      const normalDocs = res.data.filter(doc => !doc.isTemplate);
      setDocuments(normalDocs);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const generateLink = async (documentId) => {
    const email = prompt("Enter signer email to invite directly (or configure multiple signers on upload page):");
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

      alert("Signing invitation link created! Copy and share it, or check log files.");
      fetchDocuments();
    } catch (error) {
      console.error(error);
      alert("Failed to initiate signing request");
    }
  };

  const copyLink = (link) => {
    navigator.clipboard.writeText(link);
    alert("Signing URL copied to clipboard!");
  };

  const handleDownload = async (docId, docTitle) => {
    try {
      const response = await API.get(`/pdf/generate/${docId}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `signed-${docTitle.replace(/\s+/g, "_")}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error(error);
      alert("Failed to download signed PDF");
    }
  };

  const deleteDocument = async (documentId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to permanently delete this document and its fields?",
    );

    if (!confirmDelete) return;

    try {
      await API.delete(`/docs/${documentId}`);
      alert("Document deleted successfully");
      fetchDocuments();
    } catch (error) {
      console.error(error);
      alert("Failed to delete document");
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

  const getStatusBadge = (status) => {
    switch (status) {
      case "Signed":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"><FiCheckCircle /> Completed</span>;
      case "Rejected":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-50 text-red-700 dark:bg-red-955/30 dark:text-red-400"><FiXCircle /> Rejected</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"><FiClock /> Pending</span>;
    }
  };

  return (
    <>
      <Navbar />
      <DashboardStats />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
        
        {/* Main Documents Workspace */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6">
            
            {/* Action Bar & Search / Filters */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">Active Document Workflows</h2>
              <button
                onClick={() => navigate("/upload")}
                className="premium-btn premium-btn-primary self-start sm:self-auto text-xs"
              >
                <FiPlus /> New Document
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              {/* Search Bar */}
              <div className="relative flex-grow flex items-center">
                <FiSearch className="absolute left-3.5 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="premium-input text-xs pl-10 py-2.5"
                />
              </div>

              {/* Status Select Filter */}
              <div className="relative flex items-center shrink-0">
                <FiFilter className="absolute left-3.5 text-slate-400 w-4 h-4" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="premium-input text-xs pl-10 pr-8 py-2.5 bg-white cursor-pointer min-w-[140px]"
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Signed">Signed</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>

            {/* List of Documents */}
            {loading ? (
              <div className="text-center py-16 text-xs animate-pulse text-indigo-650">Loading documents...</div>
            ) : filteredDocuments.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 bg-slate-50 dark:bg-slate-900/30">
                <FiFileText className="w-10 h-10 text-slate-350 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No Documents Found</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-normal">
                  Upload a PDF document to place digital signature coordinates and invite signers.
                </p>
                <button
                  onClick={() => navigate("/upload")}
                  className="premium-btn premium-btn-primary text-xs mx-auto mt-4"
                >
                  Upload File
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredDocuments.map((doc) => (
                  <div
                    key={doc._id}
                    className="p-5 border border-slate-205/60 dark:border-slate-800 rounded-2xl flex flex-col justify-between hover:shadow-lg transition-all duration-250 bg-white dark:bg-slate-900/30"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-sm font-bold text-slate-850 dark:text-white truncate max-w-[280px]" title={doc.title}>
                          {doc.title}
                        </h3>
                        <span className="block text-[10px] text-slate-400 mt-0.5">
                          Uploaded: {new Date(doc.createdAt).toLocaleString()}
                        </span>
                      </div>
                      {getStatusBadge(doc.status)}
                    </div>

                    {/* Signers Progress Bar list */}
                    <div className="mt-3 py-2.5 border-t border-b border-slate-100 dark:border-slate-800 flex flex-col gap-2">
                      <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Signing Progression:</span>
                      <div className="flex flex-wrap gap-2 pt-0.5">
                        {doc.signers && doc.signers.length > 0 ? (
                          doc.signers.map((s, idx) => (
                            <span 
                              key={idx}
                              title={s.email}
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 ${
                                s.status === "Signed"
                                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400"
                                  : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                              }`}
                            >
                              <span className="opacity-60">{s.order}.</span> {s.name || s.email.split("@")[0]}
                              {s.status === "Signed" && <FiCheckCircle className="w-3 h-3" />}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">No signers configured</span>
                        )}
                      </div>
                    </div>

                    {/* Document Actions Row */}
                    <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-1">
                      
                      {/* Left: Open & Download buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/document/${doc._id}`)}
                          className="premium-btn premium-btn-secondary text-[11px] px-3.5 py-1.5 flex items-center gap-1.5"
                        >
                          <FiEye className="w-3.5 h-3.5" /> Details
                        </button>
                        
                        <button
                          onClick={() => handleDownload(doc._id, doc.title)}
                          disabled={doc.status !== "Signed"}
                          className={`premium-btn text-[11px] px-3.5 py-1.5 flex items-center gap-1.5 ${
                            doc.status === "Signed"
                              ? "bg-indigo-50 text-indigo-650 hover:bg-indigo-100 dark:bg-indigo-950/20 dark:text-indigo-400 cursor-pointer"
                              : "bg-slate-50 text-slate-300 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-not-allowed"
                          }`}
                        >
                          <FiDownload className="w-3.5 h-3.5" /> Download
                        </button>
                      </div>

                      {/* Right: Signature Link & Delete */}
                      <div className="flex items-center gap-2">
                        {/* If single quick invite / retry send link */}
                        {doc.status !== "Signed" && (
                          <>
                            {doc.signers && doc.signers.length > 0 ? (
                              <button
                                onClick={() => {
                                  // Copy current active signer's token link
                                  const activeSigner = doc.signers.find(s => s.status === "Pending");
                                  if (activeSigner && activeSigner.signingToken) {
                                    copyLink(`${window.location.origin}/sign/${activeSigner.signingToken}`);
                                  } else {
                                    generateLink(doc._id);
                                  }
                                }}
                                className="premium-btn premium-btn-secondary text-[11px] px-3 py-1.5 flex items-center gap-1"
                              >
                                <FiLink /> Active URL
                              </button>
                            ) : (
                              <button
                                onClick={() => generateLink(doc._id)}
                                className="premium-btn premium-btn-secondary text-[11px] px-3 py-1.5 flex items-center gap-1"
                              >
                                <FiLink /> Get URL
                              </button>
                            )}
                          </>
                        )}

                        <button
                          onClick={() => deleteDocument(doc._id)}
                          className="premium-btn premium-btn-danger text-[11px] px-3 py-1.5 flex items-center"
                        >
                          <FiTrash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Widget: Audit Activities & User Panel */}
        <div className="space-y-6">
          {/* Welcome User Panel */}
          <div className="glass-card p-6 bg-gradient-to-br from-indigo-500 to-purple-650 text-white border-0 select-none">
            <h2 className="text-lg font-bold">Hello, {user?.name}!</h2>
            <p className="text-xs text-indigo-100 mt-1 leading-normal">
              Manage your document flows and customize reusable templates inside E-SignHub.
            </p>
            <div className="mt-5 pt-3 border-t border-white/20 flex justify-between text-xs text-indigo-100">
              <span>Account Type:</span>
              <span className="font-bold">Administrator</span>
            </div>
          </div>
          
          <RecentActivity />
        </div>

      </div>
    </>
  );
}

export default Dashboard;
