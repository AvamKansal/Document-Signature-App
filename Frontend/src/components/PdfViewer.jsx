import { Document, Page, pdfjs } from "react-pdf";
import { useState } from "react";
import API from "../services/api";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

function PdfViewer({
  fileUrl,
  signatures = [],
  documentId,
  refreshSignatures,
}) {
  const [numPages, setNumPages] = useState(null);

  const handlePdfClick = async (e) => {
    const rect = e.currentTarget.getBoundingClientRect();

    const x =
      ((e.clientX - rect.left) / rect.width) * 100;

    const y =
      ((e.clientY - rect.top) / rect.height) * 100;

    try {
      await API.post("/signatures", {
        documentId,
        x,
        y,
        page: 1,
      });

      if (refreshSignatures) {
        refreshSignatures();
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div
      onClick={handlePdfClick}
      style={{
        position: "relative",
        display: "inline-block",
      }}
    >
      <Document
        file={fileUrl}
        onLoadSuccess={({ numPages }) =>
          setNumPages(numPages)
        }
      >
        {Array.from(
          new Array(numPages || 0),
          (_, index) => (
            <div
              key={index}
              style={{
                position: "relative",
              }}
            >
              <Page
                pageNumber={index + 1}
              />

              {signatures
                .filter(
                  (sig) =>
                    sig.page === index + 1
                )
                .map((sig) => (
                  <div
                    key={sig._id}
                    style={{
                      position: "absolute",
                      left: `${sig.x}%`,
                      top: `${sig.y}%`,
                      width: "120px",
                      height: "40px",
                      border:
                        "2px dashed blue",
                      background:
                        "#f0f8ff",
                      textAlign: "center",
                      lineHeight: "40px",
                      fontWeight: "bold",
                    }}
                  >
                    Sign Here
                  </div>
                ))}
            </div>
          )
        )}
      </Document>
    </div>
  );
}

export default PdfViewer;