import React, { useState } from "react";
import { apiClient } from "../api/client";

export function VideoUploader() {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    const allowed = [
      "video/mp4",
      "video/quicktime",
      "video/x-msvideo",
      "video/webm",
    ];
    if (selected && allowed.includes(selected.type)) {
      setFile(selected);
    } else {
      alert(
        "Invalid file type! Please upload a .mp4, .mov, .avi, or .webm video.",
      );
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    try {
      await apiClient.post("/videos/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (event) => {
          const percent = Math.round((event.loaded * 100) / event.total);
          setProgress(percent);
        },
      });
      alert("Video uploaded successfully!");
      setFile(null);
    } catch (err) {
      alert(err.response?.data?.detail || "Upload failed");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div style={styles.container}>
      <h3>Upload Video Pipeline</h3>
      <input type="file" accept="video/*" onChange={handleFileChange} />
      {file && <p style={{ margin: "0.5rem 0" }}>Selected: {file.name}</p>}

      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        style={styles.button}
      >
        {uploading ? `Uploading (${progress}%)` : "Upload Video"}
      </button>

      {uploading && (
        <div style={styles.progressBarBg}>
          <div
            style={{ ...styles.progressBarFill, width: `${progress}%` }}
          ></div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: "2rem",
    border: "2px dashed #9ca3af",
    borderRadius: "8px",
    textAlign: "center",
    marginTop: "1.5rem",
  },
  button: {
    marginTop: "1rem",
    padding: "0.5rem 1.5rem",
    backgroundColor: "#059669",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  progressBarBg: {
    width: "100%",
    height: "8px",
    backgroundColor: "#e5e7eb",
    borderRadius: "4px",
    marginTop: "1rem",
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#059669",
    transition: "width 0.2s",
  },
};
