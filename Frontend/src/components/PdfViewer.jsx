import { Document, Page } from "react-pdf";
import { useState } from "react";

function PdfViewer({ file }) {
  const [numPages, setNumPages] = useState();

  return (
    <Document
      file={file}
      onLoadSuccess={({ numPages }) =>
        setNumPages(numPages)
      }
    >
      {Array.from(
        new Array(numPages),
        (_, index) => (
          <Page
            key={index}
            pageNumber={index + 1}
          />
        )
      )}
    </Document>
  );
}

export default PdfViewer;