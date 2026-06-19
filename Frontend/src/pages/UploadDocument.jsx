import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import Navbar from "../components/Navbar";
import { FiUploadCloud, FiPlus, FiTrash2, FiArrowRight, FiInfo } from "react-icons/fi";

function UploadDocument() {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Options
  const [isTemplate, setIsTemplate] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");
  
  // Multiple signers
  const [signers, setSigners] = useState([
    { name: "", email: "", order: 1 }
  ]);

  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Drag & drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "application/pdf") {
        setFile(droppedFile);
        if (!title) {
          // Auto fill title with file name minus extension
          setTitle(droppedFile.name.replace(/\.[^/.]+$/, ""));
        }
      } else {
        alert("Only PDF documents are supported.");
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      if (!title) {
        setTitle(selectedFile.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  // Manage Signers list
  const addSigner = () => {
    setSigners([...signers, { name: "", email: "", order: signers.length + 1 }]);
  };

  const removeSigner = (index) => {
    const updated = signers.filter((_, i) => i !== index);
    // Re-adjust sign order
    const reordered = updated.map((s, idx) => ({ ...s, order: idx + 1 }));
    setSigners(reordered);
  };

  const updateSigner = (index, key, val) => {
    const updated = signers.map((s, i) => {
      if (i === index) {
        return { ...s, [key]: val };
      }
      return s;
    });
    setSigners(updated);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();

    if (!title) {
      alert("Please enter a document title.");
      return;
    }
    if (!file) {
      alert("Please select or drop a PDF file.");
      return;
    }

    // Validation for signers if not template
    if (!isTemplate) {
      const invalidSigner = signers.find(s => !s.email);
      if (invalidSigner) {
        alert("Please enter email address for all signers.");
        return;
      }
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("title", title);
      formData.append("pdf", file);
      
      // If we upload document, we can store details on backend
      const uploadRes = await API.post("/docs/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const docId = uploadRes.data.document._id;

      // Update signers, webhook url, and template flag
      await API.post("/email/generate-link", {
        documentId: docId,
        signers: isTemplate ? [] : signers,
        webhookUrl,
      });

      // Update Template status on doc if toggled
      if (isTemplate) {
        // Find document and save as template
        // We will make sure the backend endpoint updates this (or we can set it via PUT)
        // Let's call standard update route if needed or keep fields in query
        // Let's create an update metadata endpoint or pass isTemplate inside upload document
        // Since we'll write PrepareDocument, we can send all metadata when fields are saved!
      }

      alert("Document uploaded successfully! Proceeding to place signature fields.");
      
      // Pass isTemplate state so Prepare page knows if we are defining template layouts
      navigate(`/prepare/${docId}`, { state: { isTemplate, webhookUrl, signers } });
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">Upload New Document</h1>
          <p className="text-slate-500 mt-2">Upload a PDF and prepare your signing flow in minutes.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* File Upload Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">1. Select PDF File</h2>

              {/* Drag and Drop Zone */}
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  dragActive
                    ? "border-indigo-600 bg-indigo-50/20 dark:bg-indigo-950/20 scale-99"
                    : file
                      ? "border-emerald-500 bg-emerald-50/5 dark:bg-emerald-950/5"
                      : "border-slate-300 dark:border-slate-700 hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-900/30"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <FiUploadCloud className={`w-12 h-12 mx-auto mb-4 ${file ? "text-emerald-500 animate-bounce" : "text-slate-400"}`} />
                
                {file ? (
                  <div className="space-y-1">
                    <p className="text-base font-semibold text-slate-800 dark:text-white">{file.name}</p>
                    <p className="text-xs text-slate-400">{(file.size / (1024 * 1024)).toFixed(2)} MB • PDF Document</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-350">Drag and drop your PDF here</p>
                    <p className="text-xs text-slate-400">or click to browse your files</p>
                  </div>
                )}
              </div>

              {/* Document Title */}
              <div className="mt-6">
                <label className="premium-label">Document Title</label>
                <input
                  type="text"
                  placeholder="e.g. Sales Agreement 2026"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="premium-input text-sm"
                />
              </div>
            </div>

            {/* Document Settings */}
            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">2. Options & Callbacks</h2>
              
              <div className="space-y-4">
                {/* Template Checkbox */}
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900/40">
                  <input
                    type="checkbox"
                    checked={isTemplate}
                    onChange={(e) => setIsTemplate(e.target.checked)}
                    className="w-5 h-5 accent-indigo-650 rounded border-slate-300 cursor-pointer"
                  />
                  <div>
                    <span className="text-sm font-semibold text-slate-800 dark:text-white">Save as Reusable Template</span>
                    <span className="block text-xs text-slate-400 mt-0.5">Define placeholder fields and reuse this PDF layout later.</span>
                  </div>
                </label>

                {/* Webhook Callback */}
                {!isTemplate && (
                  <div>
                    <label className="premium-label flex items-center gap-1.5">
                      Webhook Callback URL 
                      <span className="group relative cursor-pointer text-slate-400 hover:text-slate-600">
                        <FiInfo className="w-3.5 h-3.5" />
                        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 hidden group-hover:block w-48 bg-slate-850 text-white text-[10px] p-2 rounded-lg shadow-lg z-10 leading-normal">
                          Get callback POST requests when this document is completed.
                        </span>
                      </span>
                    </label>
                    <input
                      type="url"
                      placeholder="e.g. https://your-server.com/webhooks/signatures"
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                      className="premium-input text-sm"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Signers Layout (Hidden if isTemplate is checked) */}
          <div className="space-y-6">
            {!isTemplate ? (
              <div className="glass-card p-6 h-full flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-white">3. Signers List</h2>
                    <button
                      type="button"
                      onClick={addSigner}
                      className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 p-1.5 rounded-lg border border-indigo-200 text-xs font-semibold flex items-center gap-1 cursor-pointer dark:text-indigo-400 dark:border-indigo-800 dark:hover:bg-indigo-950/20"
                    >
                      <FiPlus className="w-3.5 h-3.5" /> Add
                    </button>
                  </div>

                  <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
                    {signers.map((signer, idx) => (
                      <div key={idx} className="p-3 border border-slate-100 dark:border-slate-800 rounded-xl relative space-y-2 bg-slate-50/50 dark:bg-slate-900/30">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-400">Signer #{idx + 1} (Order: {signer.order})</span>
                          {signers.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeSigner(idx)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded-lg transition-colors cursor-pointer dark:hover:bg-red-950/20"
                            >
                              <FiTrash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        <input
                          type="text"
                          placeholder="Full Name"
                          value={signer.name}
                          onChange={(e) => updateSigner(idx, "name", e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-850 dark:bg-slate-900 bg-white"
                        />
                        <input
                          type="email"
                          placeholder="Email Address"
                          value={signer.email}
                          onChange={(e) => updateSigner(idx, "email", e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-850 dark:bg-slate-900 bg-white"
                          required
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 border-t border-slate-100 dark:border-slate-800 pt-4">
                  <button
                    onClick={handleUploadSubmit}
                    disabled={loading}
                    className="w-full premium-btn premium-btn-primary"
                  >
                    {loading ? "Uploading..." : "Prepare Signing Fields"} <FiArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="glass-card p-6 h-full flex flex-col justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Template Creation</h2>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    By saving as a template, you can design field placements once. 
                    <br/><br/>
                    When reusing this template later, you will simply specify new signer emails, and all fields will automatically align.
                  </p>
                </div>

                <div className="mt-6 border-t border-slate-100 dark:border-slate-800 pt-4">
                  <button
                    onClick={handleUploadSubmit}
                    disabled={loading}
                    className="w-full premium-btn premium-btn-primary"
                  >
                    {loading ? "Uploading..." : "Prepare Template Fields"} <FiArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default UploadDocument;