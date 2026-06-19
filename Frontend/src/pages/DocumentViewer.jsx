import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import API, { BACKEND_URL } from "../services/api";
import { FiDownload, FiCheckCircle, FiClock, FiFileText, FiChevronLeft, FiShare2, FiDatabase, FiList } from "react-icons/fi";

function DocumentViewer() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [document, setDocument] = useState(null);
  const [fields, setFields] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocumentDetails();
  }, [id]);

  const fetchDocumentDetails = async () => {
    try {
      setLoading(true);
      const docsRes = await API.get("/docs");
      const selectedDoc = docsRes.data.find((doc) => doc._id === id);
      setDocument(selectedDoc);

      if (selectedDoc) {
        // Fetch audit logs
        const logsRes = await API.get(`/audit/${id}`);
        setLogs(logsRes.data || []);

        // Fetch placed fields & data entered by signers
        const fieldsRes = await API.get(`/signatures/${id}`);
        setFields(fieldsRes.data || []);
      }
    } catch (error) {
      console.error("Failed to load details:", error);
    } finally {
      setLoading(false);
    }
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

  const exportSignerDataJson = () => {
    if (!document) return;
    
    const exportData = {
      documentId: document._id,
      title: document.title,
      status: document.status,
      signers: document.signers.map(s => ({
        name: s.name,
        email: s.email,
        status: s.status,
        signedAt: s.signedAt
      })),
      fields: fields.map(f => ({
        type: f.type,
        signerEmail: f.signerEmail,
        page: f.page,
        coordinates: { x: f.x, y: f.y },
        value: f.value,
        status: f.status
      }))
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `signer_data_${document.title.replace(/\s+/g, "_")}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-955">
        <h2 className="text-xl font-semibold animate-pulse text-indigo-650">Loading details...</h2>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <h2 className="text-xl font-bold text-slate-805">Document Not Found</h2>
        <button onClick={() => navigate("/dashboard")} className="mt-4 premium-btn premium-btn-primary">
          Back to Dashboard
        </button>
      </div>
    );
  }

  const fileUrl = `${BACKEND_URL}/${document.filePath?.replace(/\\/g, "/")}`;

  return (
    <>
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Top Navigation */}
        <div className="flex items-center gap-2 mb-6 select-none">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
          >
            <FiChevronLeft className="w-4 h-4" /> Back to Dashboard
          </button>
        </div>

        {/* Split Page Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          {/* LEFT: Metadata, Audit Trail, & Signer Data Table */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Meta details */}
            <div className="glass-card p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white leading-tight">{document.title}</h1>
                  <span className="block text-xs text-slate-400 mt-1">Document ID: {document._id}</span>
                </div>
                
                {/* Download PDF button */}
                <button
                  onClick={() => handleDownload(document._id, document.title)}
                  disabled={document.status !== "Signed"}
                  className={`premium-btn text-xs py-2 flex items-center gap-1.5 ${
                    document.status === "Signed"
                      ? "bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shadow-md"
                      : "bg-slate-100 text-slate-400 dark:bg-slate-850 cursor-not-allowed border border-slate-205 dark:border-slate-800"
                  }`}
                >
                  <FiDownload /> Download Signed PDF
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 block font-semibold mb-0.5">Workflow Status:</span>
                  <span className={`font-bold uppercase inline-flex items-center gap-1 ${
                    document.status === "Signed" ? "text-emerald-600" : "text-amber-500"
                  }`}>
                    {document.status === "Signed" ? <FiCheckCircle /> : <FiClock />}
                    {document.status}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold mb-0.5">Creation Date:</span>
                  <span className="font-medium text-slate-700 dark:text-slate-200">
                    {new Date(document.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* SIGNER DATA RETRIEVAL TABLE */}
            <div className="glass-card p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <FiDatabase className="w-4.5 h-4.5 text-indigo-500" /> Signer Data Entries
                </h2>
                {fields.length > 0 && (
                  <button
                    onClick={exportSignerDataJson}
                    className="text-xs font-semibold text-indigo-650 hover:underline cursor-pointer dark:text-indigo-400"
                  >
                    Export Data (JSON)
                  </button>
                )}
              </div>

              {fields.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  No visual inputs or signature fields placed on this document yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                        <th className="py-2.5">Signer Role/Email</th>
                        <th className="py-2.5">Field Type</th>
                        <th className="py-2.5 text-center">Page</th>
                        <th className="py-2.5">Status</th>
                        <th className="py-2.5">Captured Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {fields.map((f) => (
                        <tr key={f._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                          <td className="py-3 font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[150px]" title={f.signerEmail}>
                            {f.signerEmail}
                          </td>
                          <td className="py-3 capitalize text-slate-500">{f.type}</td>
                          <td className="py-3 text-center text-slate-500">{f.page}</td>
                          <td className="py-3">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                              f.status === "Filled"
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20"
                                : "bg-amber-50 text-amber-700 dark:bg-amber-950/20"
                            }`}>
                              {f.status}
                            </span>
                          </td>
                          <td className="py-3 font-mono text-[10px]">
                            {f.type === "signature" || f.type === "initials" ? (
                              f.value ? (
                                <a 
                                  href={`${BACKEND_URL}/${f.value}`} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                                >
                                  View Image PNG
                                </a>
                              ) : (
                                <span className="text-slate-400 italic">Unfilled</span>
                              )
                            ) : f.type === "checkbox" ? (
                              f.value === "true" ? <span className="text-emerald-600 font-bold">Checked</span> : "Unchecked"
                            ) : (
                              f.value || <span className="text-slate-400 italic">Unfilled</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Audit log list */}
            <div className="glass-card p-6">
              <h2 className="text-base font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <FiList className="w-4.5 h-4.5 text-indigo-500" /> Full Audit Trail
              </h2>
              
              <div className="space-y-4 max-h-[280px] overflow-y-auto pr-1">
                {logs.map((log) => (
                  <div key={log._id} className="flex justify-between items-start text-xs border-b border-slate-50 dark:border-slate-800/50 pb-2.5">
                    <div>
                      <span className="font-bold text-slate-750 dark:text-slate-200 capitalize">
                        {log.action.toLowerCase().replace(/_/g, " ")}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5">{log.details}</p>
                    </div>
                    <span className="text-[9px] text-slate-400 shrink-0 font-medium ml-4">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT: Document Iframe Preview Pane */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card p-5 h-full flex flex-col justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-1.5">
                  <FiFileText className="text-indigo-500" /> Document Preview
                </h2>
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-inner bg-slate-50">
                  <iframe
                    src={fileUrl}
                    title="PDF Viewer"
                    width="100%"
                    height="580px"
                    className="border-none"
                  />
                </div>
              </div>
              <p className="text-[10px] text-slate-400 text-center mt-4">
                Powered by E-SignHub secure PDF compilation services.
              </p>
            </div>
          </div>

        </div>

      </div>
    </>
  );
}

export default DocumentViewer;
