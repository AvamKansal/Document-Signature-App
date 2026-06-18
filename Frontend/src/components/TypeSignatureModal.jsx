import { useState, useRef } from "react";
import API from "../services/api";

const fonts = [
  { name: "Caveat", family: "'Caveat', cursive" },
  { name: "Pacifico", family: "'Pacifico', cursive" },
  { name: "Dancing Script", family: "'Dancing Script', cursive" },
];

function TypeSignatureModal({ x, y, page, onClose, onSave }) {
  const [text, setText] = useState("");
  const [selectedFont, setSelectedFont] = useState(fonts[0].family);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!text) {
      alert("Please enter your name");
      return;
    }

    setIsSaving(true);
    try {
      // Create offscreen canvas to generate image
      const canvas = document.createElement("canvas");
      canvas.width = 400;
      canvas.height = 150;
      const ctx = canvas.getContext("2d");

      // Draw text
      ctx.fillStyle = "blue"; // Signature color
      ctx.font = `60px ${selectedFont}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, canvas.width / 2, canvas.height / 2);

      // Convert to Blob
      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/png")
      );

      // Upload signature
      const formData = new FormData();
      formData.append("signature", blob, "typed-signature.png");

      const uploadRes = await API.post("/signature-upload", formData);
      
      onSave(uploadRes.data.path);
    } catch (error) {
      console.error(error);
      alert("Failed to generate signature");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: "30px",
          borderRadius: "12px",
          width: "100%",
          maxWidth: "500px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
        }}
      >
        <h2 style={{ marginTop: 0 }}>Type Your Signature</h2>
        <input
          type="text"
          placeholder="Enter your name"
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            fontSize: "16px",
            marginBottom: "20px",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        />

        <div style={{ marginBottom: "20px" }}>
          <p style={{ margin: "0 0 10px 0", fontWeight: "bold" }}>Choose Font:</p>
          <div style={{ display: "grid", gap: "10px" }}>
            {fonts.map((font) => (
              <div
                key={font.name}
                onClick={() => setSelectedFont(font.family)}
                style={{
                  padding: "15px",
                  border:
                    selectedFont === font.family
                      ? "2px solid #007bff"
                      : "1px solid #eee",
                  borderRadius: "8px",
                  cursor: "pointer",
                  textAlign: "center",
                  fontSize: "32px",
                  fontFamily: font.family,
                  color: "blue",
                  backgroundColor:
                    selectedFont === font.family ? "#f0f8ff" : "white",
                }}
              >
                {text || "Your Name"}
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            style={{
              padding: "10px 20px",
              background: "#ccc",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: "10px 20px",
              background: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
            disabled={isSaving || !text}
          >
            {isSaving ? "Saving..." : "Apply Signature"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default TypeSignatureModal;