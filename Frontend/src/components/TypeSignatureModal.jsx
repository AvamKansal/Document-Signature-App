import { useState, useRef, useEffect } from "react";
import API from "../services/api";
import { FiEdit2, FiType, FiUpload, FiX } from "react-icons/fi";

const fonts = [
  { name: "Caveat", family: "'Caveat', cursive" },
  { name: "Pacifico", family: "'Pacifico', cursive" },
  { name: "Dancing Script", family: "'Dancing Script', cursive" },
];

function TypeSignatureModal({ x, y, page, onClose, onSave }) {
  const [activeTab, setActiveTab] = useState("draw"); // "draw" | "type" | "upload"
  const [text, setText] = useState("");
  const [selectedFont, setSelectedFont] = useState(fonts[0].family);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadPreview, setUploadPreview] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Drawing Canvas Refs & State
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const lastX = useRef(0);
  const lastY = useRef(0);

  // Initialize Canvas Drawing Settings
  useEffect(() => {
    if (activeTab === "draw" && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      ctx.strokeStyle = "#1e3a8a"; // Deep navy blue for realistic ink
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // Fill canvas background as white (helps with opacity on generated PDF)
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, [activeTab]);

  // Drawing Handlers for Canvas (Mouse & Touch support)
  const startDrawing = (e) => {
    isDrawing.current = true;
    const { offsetX, offsetY } = getCoordinates(e);
    lastX.current = offsetX;
    lastY.current = offsetY;
  };

  const draw = (e) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const { offsetX, offsetY } = getCoordinates(e);

    ctx.beginPath();
    ctx.moveTo(lastX.current, lastY.current);
    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();

    lastX.current = offsetX;
    lastY.current = offsetY;
  };

  const stopDrawing = () => {
    isDrawing.current = false;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { offsetX: 0, offsetY: 0 };

    if (e.touches && e.touches.length > 0) {
      const rect = canvas.getBoundingClientRect();
      return {
        offsetX: e.touches[0].clientX - rect.left,
        offsetY: e.touches[0].clientY - rect.top
      };
    }
    return {
      offsetX: e.nativeEvent.offsetX,
      offsetY: e.nativeEvent.offsetY
    };
  };

  // Handle Upload Image Selection
  const handleUploadChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Convert canvas/inputs to blob and upload signature
  const handleApply = async () => {
    setIsSaving(true);
    try {
      let blob;
      let filename = "signature.png";

      if (activeTab === "draw") {
        const canvas = canvasRef.current;
        if (!canvas) return;
        blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
      } else if (activeTab === "type") {
        if (!text) {
          alert("Please type your name");
          setIsSaving(false);
          return;
        }
        // Create offscreen canvas for typed text signature
        const canvas = document.createElement("canvas");
        canvas.width = 400;
        canvas.height = 150;
        const ctx = canvas.getContext("2d");

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#1e3a8a"; // Ink blue
        ctx.font = `italic 42px ${selectedFont}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(text, canvas.width / 2, canvas.height / 2);

        blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
        filename = "typed-signature.png";
      } else if (activeTab === "upload") {
        if (!uploadFile) {
          alert("Please upload a signature image");
          setIsSaving(false);
          return;
        }
        blob = uploadFile;
        filename = uploadFile.name;
      }

      // Upload via FormData
      const formData = new FormData();
      formData.append("signature", blob, filename);

      const uploadRes = await API.post("/signature-upload", formData);
      onSave(uploadRes.data.path);
    } catch (error) {
      console.error("Save signature failed:", error);
      alert("Failed to process signature");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200/50 dark:border-slate-800/50 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Place Signature</h2>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-650 dark:hover:bg-slate-800 transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 px-4 pt-2 bg-slate-50 dark:bg-slate-900/50">
          <button
            onClick={() => setActiveTab("draw")}
            className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-all cursor-pointer ${
              activeTab === "draw"
                ? "border-indigo-600 text-indigo-650 dark:text-indigo-400"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            <FiEdit2 className="w-4 h-4" /> Draw
          </button>
          <button
            onClick={() => setActiveTab("type")}
            className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-all cursor-pointer ${
              activeTab === "type"
                ? "border-indigo-600 text-indigo-650 dark:text-indigo-400"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            <FiType className="w-4 h-4" /> Type
          </button>
          <button
            onClick={() => setActiveTab("upload")}
            className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-all cursor-pointer ${
              activeTab === "upload"
                ? "border-indigo-600 text-indigo-650 dark:text-indigo-400"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            <FiUpload className="w-4 h-4" /> Upload
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6">
          
          {/* DRAW TAB */}
          {activeTab === "draw" && (
            <div className="space-y-4">
              <div className="relative border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden bg-white dark:bg-slate-950">
                <canvas
                  ref={canvasRef}
                  width={440}
                  height={180}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-[180px] cursor-crosshair touch-none"
                />
                <button
                  onClick={clearCanvas}
                  className="absolute bottom-3 right-3 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white hover:bg-slate-55 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition-all shadow-sm cursor-pointer"
                >
                  Clear Pad
                </button>
              </div>
              <p className="text-xs text-slate-400 text-center">Use your mouse cursor or touchscreen to sign above.</p>
            </div>
          )}

          {/* TYPE TAB */}
          {activeTab === "type" && (
            <div className="space-y-4">
              <div>
                <label className="premium-label">Enter Signer Name</label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="premium-input text-base"
                />
              </div>

              <div className="space-y-2">
                <label className="premium-label">Select Cursive Style</label>
                <div className="grid gap-3">
                  {fonts.map((font) => (
                    <div
                      key={font.name}
                      onClick={() => setSelectedFont(font.family)}
                      style={{ fontFamily: font.family }}
                      className={`p-4 rounded-xl border text-2xl text-indigo-900 dark:text-indigo-300 cursor-pointer text-center select-none transition-all ${
                        selectedFont === font.family
                          ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20"
                          : "border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50 hover:bg-slate-100"
                      }`}
                    >
                      {text || "John Doe"}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* UPLOAD TAB */}
          {activeTab === "upload" && (
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-6 bg-slate-50 dark:bg-slate-900/30 text-center hover:bg-slate-100/50 transition-all relative">
                {uploadPreview ? (
                  <div className="space-y-3">
                    <img 
                      src={uploadPreview} 
                      alt="Signature Preview" 
                      className="max-h-[140px] max-w-[320px] object-contain mx-auto border border-slate-100 rounded bg-white p-2"
                    />
                    <button
                      onClick={() => { setUploadFile(null); setUploadPreview(""); }}
                      className="text-xs text-red-500 hover:underline cursor-pointer"
                    >
                      Remove and Select Another
                    </button>
                  </div>
                ) : (
                  <>
                    <FiUpload className="w-8 h-8 text-indigo-500 mb-3" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Drag or Click to upload image</span>
                    <span className="text-xs text-slate-400 mt-1">PNG, JPG, SVG with transparent background suggested</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Modal Actions */}
        <div className="flex gap-3 justify-end px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <button
            onClick={onClose}
            className="premium-btn premium-btn-secondary"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="premium-btn premium-btn-primary"
            disabled={isSaving || (activeTab === "type" && !text) || (activeTab === "upload" && !uploadFile)}
          >
            {isSaving ? "Uploading..." : "Apply Signature"}
          </button>
        </div>

      </div>
    </div>
  );
}

export default TypeSignatureModal;