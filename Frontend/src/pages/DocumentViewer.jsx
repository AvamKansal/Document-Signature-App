import { useState } from "react";
import API from "../services/api";

function DocumentViewer({ documentId }) {
  const [position, setPosition] = useState({
    x: 100,
    y: 100,
  });

  const savePosition = async () => {
    await API.post("/signatures", {
      documentId,
      x: position.x,
      y: position.y,
      page: 1,
    });

    alert("Signature Position Saved");
  };

  return (
    <div>
      <h2>Document Viewer</h2>

      <div
        style={{
          width: "800px",
          height: "1000px",
          border: "1px solid black",
          position: "relative",
        }}
      >
        <div
          draggable
          onDragEnd={(e) =>
            setPosition({
              x: e.clientX,
              y: e.clientY,
            })
          }
          style={{
            position: "absolute",
            left: position.x,
            top: position.y,
            width: "150px",
            height: "50px",
            border: "2px dashed blue",
            cursor: "move",
          }}
        >
          Sign Here
        </div>
      </div>

      <button onClick={savePosition}>
        Save Signature Position
      </button>
    </div>
  );
}

export default DocumentViewer;