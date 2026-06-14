import { useState } from "react";
import API from "../services/api";

function SignatureUploader({
  setSignaturePath,
}) {
  const [file, setFile] =
    useState(null);

  const uploadSignature =
    async () => {
      const formData =
        new FormData();

      formData.append(
        "signature",
        file
      );

      const res =
        await API.post(
          "/signature-upload",
          formData
        );

      setSignaturePath(
        res.data.path
      );
    };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={(e) =>
          setFile(
            e.target.files[0]
          )
        }
      />

      <button
        onClick={uploadSignature}
      >
        Upload Signature
      </button>
    </div>
  );
}

export default SignatureUploader;