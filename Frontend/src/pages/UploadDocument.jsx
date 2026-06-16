import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import Navbar from "../components/Navbar";

function UploadDocument() {
  const [title, setTitle] =
    useState("");

  const [file, setFile] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const navigate = useNavigate();

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!title || !file) {
      alert(
        "Please enter title and select PDF"
      );
      return;
    }

    try {
      setLoading(true);

      const formData =
        new FormData();

      formData.append(
        "title",
        title
      );

      formData.append(
        "pdf",
        file
      );

      await API.post(
        "/docs/upload",
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      alert(
        "Document uploaded successfully"
      );

      navigate("/dashboard");
    } catch (error) {
      console.log(error);

      alert(
        "Upload failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <div
        style={{
          maxWidth: "600px",
          margin: "40px auto",
          padding: "30px",
          background: "#fff",
          borderRadius: "12px",
          boxShadow:
            "0 2px 10px rgba(0,0,0,0.1)",
        }}
      >
        <h1>
          Upload Document
        </h1>

        <form
          onSubmit={
            handleUpload
          }
        >
          <div
            style={{
              marginBottom:
                "15px",
            }}
          >
            <label>
              Document Title
            </label>

            <input
              type="text"
              value={title}
              onChange={(e) =>
                setTitle(
                  e.target.value
                )
              }
              style={{
                width: "100%",
                padding: "10px",
                marginTop:
                  "5px",
              }}
            />
          </div>

          <div
            style={{
              marginBottom:
                "20px",
            }}
          >
            <label>
              Select PDF
            </label>

            <input
              type="file"
              accept=".pdf"
              onChange={(e) =>
                setFile(
                  e.target
                    .files[0]
                )
              }
              style={{
                display:
                  "block",
                marginTop:
                  "10px",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={
              loading
            }
            style={{
              background:
                "#2563eb",
              color: "white",
              border:
                "none",
              padding:
                "10px 20px",
              borderRadius:
                "6px",
              cursor:
                "pointer",
            }}
          >
            {loading
              ? "Uploading..."
              : "Upload Document"}
          </button>
        </form>
      </div>
    </>
  );
}

export default UploadDocument;