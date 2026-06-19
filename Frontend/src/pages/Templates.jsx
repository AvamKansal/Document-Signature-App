import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import Navbar from "../components/Navbar";
import { FiCopy, FiTrash2, FiFileText, FiPlus, FiSend, FiX, FiCheck } from "react-icons/fi";

function Templates() {
  const navigate = useNavigate();
  
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Instantiating modal state
  const [activeTemplate, setActiveTemplate] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [signerInputs, setSignerInputs] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await API.get("/docs");
      // Filter documents marked as templates
      const filtered = res.data.filter(d => d.isTemplate === true);
      setTemplates(filtered);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Open modal to instantiate template
  const handleUseTemplate = (template) => {
    setActiveTemplate(template);
    
    // Initialize input fields based on the number of signers in the template
    const inputs = (template.signers || []).map((s, idx) => ({
      name: "",
      email: "",
      order: s.order || idx + 1,
      roleName: s.name || `Signer ${idx + 1}` // e.g. "Buyer", "Seller"
    }));

    // If template has no signers (edge case), initialize with 1 signer
    if (inputs.length === 0) {
      inputs.push({ name: "", email: "", order: 1, roleName: "Signer 1" });
    }

    setSignerInputs(inputs);
    setModalOpen(true);
  };

  const handleInputChange = (index, key, val) => {
    setSignerInputs(signerInputs.map((input, idx) => {
      if (idx === index) {
        return { ...input, [key]: val };
      }
      return input;
    }));
  };

  // Submit request to clone template and send signature emails
  const handleSubmitInstance = async (e) => {
    e.preventDefault();
    
    const invalidInput = signerInputs.find(s => !s.email);
    if (invalidInput) {
      alert("Please specify email address for all signers.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await API.post("/docs/use-template", {
        templateId: activeTemplate._id,
        signers: signerInputs.map(s => ({
          name: s.name,
          email: s.email,
          order: s.order
        }))
      });

      alert("Document sent successfully from template!");
      setModalOpen(false);
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to create document from template");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    const confirm = window.confirm("Are you sure you want to delete this template?");
    if (!confirm) return;

    try {
      await API.delete(`/docs/${templateId}`);
      alert("Template deleted successfully");
      fetchTemplates();
    } catch (error) {
      console.error(error);
      alert("Failed to delete template");
    }
  };

  return (
    <>
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">Document Templates</h1>
            <p className="text-slate-500 mt-1.5">Manage and reuse layouts for repetitive document signoffs.</p>
          </div>
          <button
            onClick={() => navigate("/upload")}
            className="premium-btn premium-btn-primary"
          >
            <FiPlus /> Create Template
          </button>
        </div>

        {/* Templates Grid */}
        {loading ? (
          <div className="text-center py-16">
            <h2 className="text-lg font-semibold animate-pulse text-indigo-650">Loading templates...</h2>
          </div>
        ) : templates.length === 0 ? (
          <div className="glass-card p-12 text-center max-w-xl mx-auto">
            <FiFileText className="w-12 h-12 text-slate-350 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-700 dark:text-white mb-2">No Templates Found</h2>
            <p className="text-sm text-slate-450 leading-relaxed mb-6">
              Create a template to pre-set signing boxes (Signatures, Initials, Custom Text) for layout structures you send out frequently.
            </p>
            <button
              onClick={() => navigate("/upload")}
              className="premium-btn premium-btn-primary mx-auto"
            >
              Upload First Template
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((tpl) => (
              <div key={tpl._id} className="glass-card p-6 flex flex-col justify-between hover:shadow-xl transition-all duration-300 border border-slate-200/40 hover:border-slate-300 dark:hover:border-slate-750">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-base font-bold text-slate-800 dark:text-white truncate max-w-[200px]" title={tpl.title}>
                      {tpl.title}
                    </h3>
                    <button
                      onClick={() => handleDeleteTemplate(tpl._id)}
                      className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors cursor-pointer dark:hover:bg-red-950/20"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <p className="text-xs text-slate-400">PDF File: {tpl.fileName}</p>
                  
                  <div className="mt-4 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Signer Roles ({tpl.signers?.length || 0}):</span>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {tpl.signers?.map((s, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-semibold dark:bg-indigo-950/30 dark:text-indigo-400">
                          {s.name || `Role ${idx + 1}`}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                  <button
                    onClick={() => handleUseTemplate(tpl)}
                    className="w-full premium-btn premium-btn-primary text-xs py-2"
                  >
                    <FiCopy className="w-3.5 h-3.5" /> Use Template
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Modal: Instantiate Template */}
      {modalOpen && activeTemplate && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200/50 dark:border-slate-800/50 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">Use Template: {activeTemplate.title}</h2>
              <button 
                onClick={() => setModalOpen(false)} 
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitInstance}>
              <div className="p-6 space-y-4 max-h-[360px] overflow-y-auto">
                <p className="text-xs text-slate-450 leading-relaxed mb-2">
                  Please assign actual names and email addresses for the signer roles placeholder defined in this template.
                </p>

                {signerInputs.map((input, idx) => (
                  <div key={idx} className="p-3 border border-slate-100 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30 space-y-2">
                    <span className="text-[10px] font-bold text-indigo-650 dark:text-indigo-400">
                      Role {idx + 1}: {input.roleName}
                    </span>
                    <input
                      type="text"
                      placeholder="Signer Name"
                      value={input.name}
                      onChange={(e) => handleInputChange(idx, "name", e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-850 dark:bg-slate-900 bg-white"
                      required
                    />
                    <input
                      type="email"
                      placeholder="Signer Email"
                      value={input.email}
                      onChange={(e) => handleInputChange(idx, "email", e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-850 dark:bg-slate-900 bg-white"
                      required
                    />
                  </div>
                ))}
              </div>

              <div className="flex gap-2 justify-end px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="premium-btn premium-btn-secondary py-2"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="premium-btn premium-btn-primary py-2"
                  disabled={submitting}
                >
                  {submitting ? "Sending..." : "Send Signature Request"} <FiSend className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </>
  );
}

export default Templates;
