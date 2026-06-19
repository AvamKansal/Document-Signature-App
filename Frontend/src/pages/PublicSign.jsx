import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Document, Page, pdfjs } from "react-pdf";
import API from "../services/api";
import TypeSignatureModal from "../components/TypeSignatureModal";
import { FiCheckCircle, FiEdit3, FiInfo, FiFileText } from "react-icons/fi";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

function PublicSign() {
  const { token } = useParams();
  const [searchParams] = useSearchParams();
  const isEmbedded = searchParams.get("embed") === "true";

  const [documentDetails, setDocumentDetails] = useState(null);
  const [signer, setSigner] = useState(null);
  const [fields, setFields] = useState([]);
  const [numPages, setNumPages] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal drawing variables
  const [modalOpen, setModalOpen] = useState(false);
  const [activeFieldId, setActiveFieldId] = useState(null);

  useEffect(() => {
    fetchSigningDetails();
  }, [token]);

  const fetchSigningDetails = async () => {
    try {
      const res = await API.get(`/email/document/${token}`);
      setDocumentDetails(res.data.document);
      setSigner(res.data.signer);
      
      // Map loaded fields to state (with empty default values if not pre-filled)
      const mappedFields = res.data.fields.map(f => ({
        ...f,
        value: f.value || (f.type === "date" ? new Date().toLocaleDateString() : "")
      }));
      setFields(mappedFields);
    } catch (error) {
      console.error(error);
      alert("Invalid or expired signing link");
    } finally {
      setLoading(false);
    }
  };

  // Get only fields assigned to the current active signer
  const signerFields = fields.filter(f => f.signerEmail === signer?.email);
  const completedFields = signerFields.filter(f => {
    if (f.type === "checkbox") return f.value === "true";
    return f.value && f.value.trim() !== "";
  });

  const allFieldsCompleted = signerFields.length === completedFields.length;

  const handleFieldChange = (fieldId, value) => {
    setFields(fields.map(f => {
      if (f._id === fieldId) {
        return { ...f, value };
      }
      return f;
    }));
  };

  // Signature Click opens modal
  const handleSignatureClick = (fieldId) => {
    if (documentDetails?.status === "Signed") return;
    setActiveFieldId(fieldId);
    setModalOpen(true);
  };

  // Save Signature Path from Modal
  const handleSaveSignature = (signaturePath) => {
    setModalOpen(false);
    handleFieldChange(activeFieldId, signaturePath);
  };

  // Submit signing inputs
  const handleSubmitSigning = async () => {
    if (!allFieldsCompleted) {
      alert("Please complete all assigned signature and input fields before finishing.");
      return;
    }

    try {
      setLoading(true);
      // Format payload: array of { id, value }
      const fieldValues = signerFields.map(f => ({
        id: f._id,
        value: f.value
      }));

      const res = await API.post(`/email/document/${token}/sign`, {
        fieldValues
      });

      alert(res.data.message || "Document signed successfully!");

      // If embedded, post message to host website
      if (isEmbedded) {
        window.parent.postMessage({ event: "signing_completed", token }, "*");
      }

      fetchSigningDetails();
    } catch (error) {
      console.error(error);
      alert("Failed to submit signatures. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading || !documentDetails || !signer) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <h2 className="text-xl font-semibold animate-pulse text-indigo-650">Loading document...</h2>
      </div>
    );
  }

  const fileUrl = `http://localhost:5000/${documentDetails.filePath?.replace(/\\/g, "/")}`;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col">
      {/* Top Header Panel (Hides if embedded) */}
      {!isEmbedded && (
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-4 px-6 flex justify-between items-center shadow-sm select-none">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-indigo-500/10">
              E
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-800 dark:text-white truncate max-w-[240px]">{documentDetails.title}</h1>
              <p className="text-[10px] text-slate-400">Owner ID: {documentDetails.uploadedBy}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold text-slate-500">Signing as:</span>
            <span className="block text-xs font-bold text-indigo-650 dark:text-indigo-400">{signer.name || signer.email}</span>
          </div>
        </header>
      )}

      {/* Main Grid View */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden h-[calc(100vh-68px)]">
        
        {/* PDF Document Canvas View */}
        <div className="flex-grow overflow-y-auto p-6 flex justify-center items-start">
          <div className="space-y-6 select-none relative">
            
            {/* Status alerts */}
            {documentDetails.status === "Signed" ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3 max-w-lg mx-auto dark:bg-emerald-950/20 dark:border-emerald-900/30">
                <FiCheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-400">Signing Completed</h4>
                  <p className="text-xs text-emerald-600 dark:text-emerald-500">This document has been fully signed and certified.</p>
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3 max-w-lg mx-auto dark:bg-amber-950/20 dark:border-amber-900/30">
                <FiInfo className="w-5 h-5 text-amber-600 shrink-0" />
                <div className="text-left">
                  <h4 className="text-xs font-bold text-amber-800 dark:text-amber-400">Action Required</h4>
                  <p className="text-[11px] text-amber-600 dark:text-amber-500 leading-normal">
                    Click each highlighted yellow field box on the PDF below to fill in your signature, initials, or text values.
                  </p>
                </div>
              </div>
            )}

            <Document
              file={fileUrl}
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
              className="space-y-6"
            >
              {Array.from(new Array(numPages || 0), (_, index) => {
                const pageNumber = index + 1;

                return (
                  <div
                    key={index}
                    className="relative border border-slate-350 shadow-md rounded bg-white dark:bg-slate-900 inline-block overflow-hidden"
                  >
                    <Page
                      pageNumber={pageNumber}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                    />

                    {/* Render Fields */}
                    {fields
                      .filter((f) => f.page === pageNumber)
                      .map((f) => {
                        const isCurrentSignerField = f.signerEmail === signer.email;
                        const isDocSigned = documentDetails.status === "Signed";

                        // Position Styles
                        const fieldStyles = {
                          position: "absolute",
                          left: `${f.x}%`,
                          top: `${f.y}%`,
                          width: `${f.width || (f.type === "checkbox" ? 4.5 : 15)}%`,
                          height: `${f.height || (f.type === "checkbox" ? 3.5 : 5)}%`,
                        };

                        // 1. Signature/Initials Fields
                        if (f.type === "signature" || f.type === "initials") {
                          if (f.value) {
                            return (
                              <img
                                key={f._id}
                                src={`http://localhost:5000/${f.value}`}
                                alt="Signature"
                                style={fieldStyles}
                                onClick={() => isCurrentSignerField && handleSignatureClick(f._id)}
                                className={`bg-white border object-contain p-1 rounded border-indigo-200 cursor-pointer shadow-sm`}
                              />
                            );
                          }
                          return (
                            <button
                              key={f._id}
                              style={fieldStyles}
                              disabled={!isCurrentSignerField || isDocSigned}
                              onClick={() => handleSignatureClick(f._id)}
                              className={`border-2 border-dashed ${
                                isCurrentSignerField
                                  ? "border-amber-500 bg-amber-50/40 hover:bg-amber-100 animate-pulse text-amber-700 font-bold"
                                  : "border-slate-200 bg-slate-50 text-slate-400"
                              } flex items-center justify-center rounded-lg text-[10px] cursor-pointer`}
                            >
                              <FiEdit3 className="w-3.5 h-3.5 mr-1" />
                              {f.type === "signature" ? "Sign Here" : "Initials"}
                            </button>
                          );
                        }

                        // 2. Text/Date Fields
                        if (f.type === "text" || f.type === "date") {
                          return (
                            <input
                              key={f._id}
                              type="text"
                              style={fieldStyles}
                              value={f.value || ""}
                              placeholder={f.type === "date" ? "Date" : "Type Text"}
                              disabled={!isCurrentSignerField || isDocSigned}
                              onChange={(e) => handleFieldChange(f._id, e.target.value)}
                              className={`border-2 px-1 text-[11px] rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                                isCurrentSignerField
                                  ? "border-amber-400 bg-amber-50/20 text-slate-800 dark:text-slate-100 dark:bg-amber-950/10"
                                  : "border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800"
                              }`}
                            />
                          );
                        }

                        // 3. Checkbox Fields
                        if (f.type === "checkbox") {
                          const isChecked = f.value === "true";
                          return (
                            <input
                              key={f._id}
                              type="checkbox"
                              style={fieldStyles}
                              checked={isChecked}
                              disabled={!isCurrentSignerField || isDocSigned}
                              onChange={(e) => handleFieldChange(f._id, e.target.checked ? "true" : "false")}
                              className={`w-5 h-5 cursor-pointer accent-indigo-650 border rounded ${
                                isCurrentSignerField
                                  ? "border-amber-400 bg-amber-50"
                                  : "border-slate-200 bg-slate-50"
                              }`}
                            />
                          );
                        }

                        return null;
                      })}
                  </div>
                );
              })}
            </Document>
          </div>
        </div>

        {/* Sidebar: Progress Indicator and Sign button */}
        {documentDetails.status !== "Signed" && (
          <div className="w-full md:w-72 bg-white dark:bg-slate-900 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between shadow-lg z-10 select-none">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Signing Progress</h3>
              
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-500 font-semibold">
                  <span>Assigned Fields</span>
                  <span>{completedFields.length} of {signerFields.length} filled</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${signerFields.length ? (completedFields.length / signerFields.length) * 100 : 0}%` }}
                    className="bg-indigo-600 h-full rounded-full transition-all duration-350"
                  />
                </div>
              </div>

              {/* Placed Fields Checklist */}
              <div className="space-y-2 max-h-[220px] overflow-y-auto pt-2">
                {signerFields.map((f, idx) => {
                  const isFilled = f.type === "checkbox" ? f.value === "true" : f.value && f.value.trim() !== "";
                  return (
                    <div 
                      key={f._id} 
                      className={`p-2 border rounded-xl flex items-center justify-between text-xs ${
                        isFilled 
                          ? "border-emerald-100 bg-emerald-50/20 text-emerald-800 dark:border-emerald-950/20 dark:text-emerald-400" 
                          : "border-slate-100 bg-slate-50/50 text-slate-400 dark:border-slate-800"
                      }`}
                    >
                      <span className="capitalize font-semibold flex items-center gap-1.5">
                        <FiFileText /> {f.type} (Page {f.page})
                      </span>
                      <span className="font-bold text-[10px] uppercase">
                        {isFilled ? "Filled" : "Required"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={handleSubmitSigning}
                disabled={!allFieldsCompleted}
                className="w-full premium-btn premium-btn-primary"
              >
                Finish Signing
              </button>
              <p className="text-[10px] text-slate-400 text-center mt-2.5 leading-normal">
                By clicking "Finish Signing", you agree to place this binding signature onto this document.
              </p>
            </div>
          </div>
        )}

      </div>

      {/* Signature Placement Modal */}
      {modalOpen && (
        <TypeSignatureModal
          onClose={() => setModalOpen(false)}
          onSave={handleSaveSignature}
        />
      )}
    </div>
  );
}

export default PublicSign;