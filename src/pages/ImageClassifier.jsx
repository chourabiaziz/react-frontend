import React, { useState } from "react";
import axios from "axios";

const API_BASE = "http://127.0.0.1:5000";

function ImageClassifier() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(`${API_BASE}/classify-image`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h3>🧠 Reconnaissance d’image (Type de déchet)</h3>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <button className="btn btn-primary m-2" onClick={handleUpload}>
        Analyser
      </button>

      {loading && <p>Analyse en cours...</p>}
      {result && (
        <div className="mt-3">
          <h5>Résultat : {result.type_detected}</h5>
          <pre>{JSON.stringify(result.predictions, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default ImageClassifier;
