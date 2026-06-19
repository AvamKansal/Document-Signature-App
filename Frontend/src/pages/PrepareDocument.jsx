import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Document, Page, pdfjs } from "react-pdf";
import API from "../services/api";
import Navbar from "../components/Navbar";
import { FiFileText, FiUser, FiTrash2, FiSave, FiCheckSquare, FiCalendar, FiEdit3, FiType } from "react-icons/fi";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const signerColors = [
  { border: "border-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-950/30", text: "text-indigo-650 dark:text-indigo-400" },
  { border: "border-amber-500", bg: "bg-amber-50 dark:bg-amber-950/30", text: "text-amber-650 dark:text-amber-400" },
  { border: "border-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/30", text: "text-emerald-650 dark:text-emerald-400" },
  { border: "border-rose-500", bg: "bg-rose-50 dark:bg-rose-950/30", text: "text-rose-650 dark:text-rose-400" },
];

function PrepareDocument() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [docDetails, setDocDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [numPages, setNumPages] = useState(null);

  const [signers, setSigners] = useState([]);
  const [selectedSignerIndex, setSelectedSignerIndex] = useState(0);

  const [selectedFieldType, setSelectedFieldType] = useState("signature");

  const [fields, setFields] = useState([]);

  // Drag states
  const [draggingFieldId, setDraggingFieldId] = useState(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const dragStartCoords = useRef({ x: 0, y: 0 });

  // Resize states
  const [resizingFieldId, setResizingFieldId] = useState(null);
  const resizeStartPos = useRef({ x: 0, y: 0 });
  const resizeStartDims = useRef({ width: 15, height: 5 });

  useEffect(() => {
    fetchDocDetails();
  }, []);

  const fetchDocDetails = async () => {
    try {
      const docsRes = await API.get("/docs");
      const found = docsRes.data.find(d => d._id === id);
      if (!found) {
        alert("Document not found");
        navigate("/dashboard");
        return;
      }
      setDocDetails(found);
      setSigners(found.signers || []);
      
      const fieldsRes = await API.get(`/signatures/${id}`);
      setFields(fieldsRes.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getDefaultDims = (type) => {
    switch (type) {
      case "signature": return { width: 18, height: 6 };
      case "initials": return { width: 10, height: 5 };
      case "text": return { width: 16, height: 4.5 };
      case "date": return { width: 14, height: 4.5 };
      case "checkbox": return { width: 4.5, height: 3.5 };
      default: return { width: 15, height: 5 };
    }
  };

  const handlePdfClick = (e, pageNumber) => {
    if (draggingFieldId || resizingFieldId) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 105; // slight offset adjustment for layout

    const activeSigner = signers[selectedSignerIndex];
    if (!activeSigner) {
      alert("Please select a signer first");
      return;
    }

    const dims = getDefaultDims(selectedFieldType);

    const newField = {
      _id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: selectedFieldType,
      x,
      y: y - (dims.height / 2), // center placement on click
      width: dims.width,
      height: dims.height,
      page: pageNumber,
      signerEmail: activeSigner.email
    };

    setFields([...fields, newField]);
  };

  // Drag handlers
  const handleDragStart = (e, fieldId) => {
    e.stopPropagation();
    if (resizingFieldId) return;
    setDraggingFieldId(fieldId);
    
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    
    const field = fields.find(f => f._id === fieldId);
    if (field) {
      dragStartCoords.current = { x: field.x, y: field.y };
    }
  };

  const handleDragMove = (e, pageNumber, rectRef) => {
    if (!draggingFieldId) return;
    e.preventDefault();

    const rect = rectRef.getBoundingClientRect();
    const deltaX = e.clientX - dragStartPos.current.x;
    const deltaY = e.clientY - dragStartPos.current.y;
    
    const deltaPctX = (deltaX / rect.width) * 100;
    const deltaPctY = (deltaY / rect.height) * 100;

    const field = fields.find(f => f._id === draggingFieldId);
    const fW = field?.width || 15;
    const fH = field?.height || 5;

    let newX = Math.max(0, Math.min(100 - fW, dragStartCoords.current.x + deltaPctX));
    let newY = Math.max(0, Math.min(100 - fH, dragStartCoords.current.y + deltaPctY));

    setFields(fields.map(f => {
      if (f._id === draggingFieldId) {
        return { ...f, x: newX, y: newY, page: pageNumber };
      }
      return f;
    }));
  };

  // Resize handlers
  const handleResizeStart = (e, fieldId) => {
    e.stopPropagation();
    e.preventDefault();
    setResizingFieldId(fieldId);

    resizeStartPos.current = { x: e.clientX, y: e.clientY };

    const field = fields.find(f => f._id === fieldId);
    if (field) {
      resizeStartDims.current = {
        width: field.width || 15,
        height: field.height || 5
      };
    }
  };

  const handleResizeMove = (e, pageNumber, rectRef) => {
    if (!resizingFieldId) return;
    e.preventDefault();

    const rect = rectRef.getBoundingClientRect();
    const deltaX = e.clientX - resizeStartPos.current.x;
    const deltaY = e.clientY - resizeStartPos.current.y;

    const deltaPctW = (deltaX / rect.width) * 100;
    const deltaPctH = (deltaY / rect.height) * 100;

    let newW = Math.max(3, Math.min(60, resizeStartDims.current.width + deltaPctW));
    let newH = Math.max(2, Math.min(30, resizeStartDims.current.height + deltaPctH));

    setFields(fields.map(f => {
      if (f._id === resizingFieldId) {
        return { ...f, width: newW, height: newH };
      }
      return f;
    }));
  };

  const handleMouseMove = (e, pageNumber, rectRef) => {
    if (draggingFieldId) {
      handleDragMove(e, pageNumber, rectRef);
    } else if (resizingFieldId) {
      handleResizeMove(e, pageNumber, rectRef);
    }
  };

  const handleMouseUpOrLeave = () => {
    setDraggingFieldId(null);
    setResizingFieldId(null);
  };

  const deleteField = (id) => {
    setFields(fields.filter(f => f._id !== id));
  };

  const handleSaveAndSend = async () => {
    if (fields.length === 0) {
      alert("Please place at least one signing field on the document.");
      return;
    }

    try {
      setLoading(true);
      const cleanedFields = fields.map(f => ({
        type: f.type,
        x: f.x,
        y: f.y,
        width: f.width,
        height: f.height,
        page: f.page,
        signerEmail: f.signerEmail
      }));

      await API.post("/signatures/bulk", {
        documentId: id,
        fields: cleanedFields
      });

      if (location.state?.isTemplate) {
        await API.post(`/email/generate-link`, {
          documentId: id,
          signers: [],
          isTemplate: true
        });
        alert("Template configured successfully!");
      } else {
        alert("Document configured! Signing request emails dispatched.");
      }

      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      alert("Failed to save signing fields");
    } finally {
      setLoading(false);
    }
  };

  const getFieldIcon = (type) => {
    switch (type) {
      case "signature": return <FiEdit3 className="w-4 h-4" />;
      case "initials": return <FiEdit3 className="w-3.5 h-3.5" />;
      case "text": return <FiType className="w-4 h-4" />;
      case "date": return <FiCalendar className="w-4 h-4" />;
      case "checkbox": return <FiCheckSquare className="w-4 h-4" />;
      default: return <FiFileText className="w-4 h-4" />;
    }
  };

  if (loading || !docDetails) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-955">
        <h2 className="text-xl font-semibold animate-pulse text-indigo-600">Loading editor...</h2>
      </div>
    );
  }

  const fileUrl = `http://localhost:5000/${docDetails.filePath?.replace(/\\/g, "/")}`;

  return (
    <>
      <Navbar />

      <div className="flex h-[calc(100vh-68px)] overflow-hidden bg-slate-100 dark:bg-slate-950">
        
        {/* Left Sidebar */}
        <div className="w-72 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between select-none">
          <div className="p-5 space-y-6">
            
            {/* Signer Selection */}
            <div className="space-y-2">
              <label className="premium-label flex items-center gap-1.5"><FiUser /> Active Signer</label>
              <select
                value={selectedSignerIndex}
                onChange={(e) => setSelectedSignerIndex(parseInt(e.target.value))}
                className="premium-input text-xs"
              >
                {signers.map((s, idx) => (
                  <option key={s.email} value={idx}>
                    {s.name || s.email} (Order {s.order})
                  </option>
                ))}
              </select>
              {signers[selectedSignerIndex] && (
                <p className="text-[11px] text-slate-400 truncate">
                  Assigned Email: <strong>{signers[selectedSignerIndex].email}</strong>
                </p>
              )}
            </div>

            {/* Field Types Picker */}
            <div className="space-y-3">
              <label className="premium-label">Select Field Type to Place</label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { id: "signature", label: "Signature Field" },
                  { id: "initials", label: "Initials Field" },
                  { id: "text", label: "Text Input Box" },
                  { id: "date", label: "Date Field" },
                  { id: "checkbox", label: "Checkbox Option" }
                ].map((ft) => (
                  <button
                    key={ft.id}
                    onClick={() => setSelectedFieldType(ft.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border font-medium text-xs text-left cursor-pointer transition-all ${
                      selectedFieldType === ft.id
                        ? "border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400"
                        : "border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    {getFieldIcon(ft.id)}
                    {ft.label}
                  </button>
                ))}
              </div>
            </div>

          </div>

          <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <button
              onClick={handleSaveAndSend}
              className="w-full premium-btn premium-btn-primary"
            >
              <FiSave /> {location.state?.isTemplate ? "Save Template" : "Send Document"}
            </button>
          </div>
        </div>

        {/* Center: PDF Pages Viewer */}
        <div className="flex-1 overflow-y-auto p-8 flex justify-center h-full">
          <div className="space-y-8 select-none">
            <div className="bg-slate-200 border border-slate-300 dark:border-slate-800 p-2.5 rounded-lg shadow-sm text-xs text-slate-600 text-center font-medium max-w-lg mx-auto leading-normal">
              💡 <strong>Instructions:</strong> Click anywhere on a page to place a field. Drag boxes to **move** them. Drag the **dot handle** in the bottom-right corner of a box to **resize** it.
            </div>

            <Document
              file={fileUrl}
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
              className="space-y-6 animate-in fade-in duration-300"
            >
              {Array.from(new Array(numPages || 0), (_, index) => {
                const pageNumber = index + 1;
                let pageRectRef = null;

                return (
                  <div
                    key={index}
                    ref={(el) => (pageRectRef = el)}
                    onClick={(e) => handlePdfClick(e, pageNumber)}
                    onMouseMove={(e) => handleMouseMove(e, pageNumber, pageRectRef)}
                    onMouseUp={handleMouseUpOrLeave}
                    onMouseLeave={handleMouseUpOrLeave}
                    className="relative border border-slate-300 shadow-lg rounded bg-white dark:bg-slate-900 inline-block overflow-hidden"
                  >
                    <Page
                      pageNumber={pageNumber}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                    />

                    {/* Placed Fields on this page */}
                    {fields
                      .filter((f) => f.page === pageNumber)
                      .map((f) => {
                        const signerIndex = signers.findIndex((s) => s.email === f.signerEmail);
                        const clr = signerColors[signerIndex % signerColors.length] || signerColors[0];

                        return (
                          <div
                            key={f._id}
                            style={{
                              position: "absolute",
                              left: `${f.x}%`,
                              top: `${f.y}%`,
                              width: `${f.width || 15}%`,
                              height: `${f.height || 5}%`,
                            }}
                            onMouseDown={(e) => handleDragStart(e, f._id)}
                            className={`border-2 border-dashed ${clr.border} ${clr.bg} flex items-center justify-between px-2 rounded-lg cursor-move select-none shadow-sm group relative overflow-visible`}
                          >
                            <span className={`text-[10px] font-bold ${clr.text} flex items-center gap-1.5 truncate pr-2`}>
                              {getFieldIcon(f.type)}
                              {f.type !== "checkbox" && f.type.charAt(0).toUpperCase() + f.type.slice(1)}
                            </span>
                            
                            {/* Delete Button */}
                            <button
                              onMouseDown={(e) => e.stopPropagation()}
                              onClick={() => deleteField(f._id)}
                              className="text-red-500 hover:text-red-700 hidden group-hover:block transition-colors cursor-pointer absolute top-1 right-1 bg-white dark:bg-slate-900 rounded p-0.5 shadow-sm border border-slate-100 dark:border-slate-800"
                            >
                              <FiTrash2 className="w-3 h-3" />
                            </button>

                            {/* Resize handle (bottom right) */}
                            <div
                              onMouseDown={(e) => handleResizeStart(e, f._id)}
                              className="absolute bottom-[-5px] right-[-5px] w-3 h-3 bg-indigo-600 hover:bg-indigo-700 cursor-se-resize rounded-full border-2 border-white dark:border-slate-900 z-20 shadow-md transition-all scale-100 hover:scale-120"
                              title="Drag to resize"
                            />
                          </div>
                        );
                      })}
                  </div>
                );
              })}
            </Document>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-72 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 overflow-y-auto">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4">Placed Fields ({fields.length})</h3>
          
          {fields.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              No fields placed yet. Click on the document pages to add boxes.
            </div>
          ) : (
            <div className="space-y-2">
              {fields.map((f, idx) => {
                const signerIndex = signers.findIndex((s) => s.email === f.signerEmail);
                const signer = signers[signerIndex];
                const clr = signerColors[signerIndex % signerColors.length] || signerColors[0];

                return (
                  <div key={f._id} className="p-3 border border-slate-100 dark:border-slate-800 rounded-xl flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/30 text-xs">
                    <div>
                      <div className="font-semibold text-slate-800 dark:text-white capitalize flex items-center gap-1">
                        {getFieldIcon(f.type)} {f.type} (Page {f.page})
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Dims: {Math.round(f.width)}% × {Math.round(f.height)}%
                      </div>
                      <div className={`text-[10px] font-medium mt-0.5 ${clr.text} truncate max-w-[170px]`}>
                        To: {signer?.name || signer?.email || "Template Role"}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteField(f._id)}
                      className="text-red-400 hover:text-red-600 transition-colors cursor-pointer"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </>
  );
}

export default PrepareDocument;
