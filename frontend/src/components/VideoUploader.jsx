import React, { useState } from "react";
import { apiClient } from "../api/client";

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB in bytes

export function VideoUploader() {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setErrorMessage(null);

    if (!selected) {
      setFile(null);
      return;
    }

    if (selected.type !== "video/mp4" && !selected.name.toLowerCase().endsWith(".mp4")) {
      setErrorMessage("Invalid file type! Please upload an MP4 video.");
      setFile(null);
      return;
    }

    if (selected.size > MAX_FILE_SIZE) {
      setErrorMessage(`File size exceeds 100MB limit (selected: ${formatFileSize(selected.size)})`);
      setFile(null);
      return;
    }

    setFile(selected);
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    setErrorMessage(null);
    try {
      await apiClient.post("/video/process", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (event) => {
          const percent = Math.round((event.loaded * 100) / event.total);
          setProgress(percent);
        },
      });
      alert("Video uploaded successfully!");
      setFile(null);
      setProgress(0);
    } catch (err) {
      setErrorMessage(err.response?.data?.detail || "Upload failed");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div style={styles.container}>
      <h3>Upload Video Pipeline</h3>
      <input 
        type="file" 
        accept="video/mp4,.mp4" 
        onChange={handleFileChange}
        disabled={uploading}
      />

      {errorMessage && (
        <p style={styles.error}>{errorMessage}</p>
      )}

      {file && (
        <div style={styles.fileInfo}>
          <p style={{ margin: "0.5rem 0" }}>
            Selected: <strong>{file.name}</strong>
          </p>
          <p style={{ margin: "0.5rem 0", color: "#6b7280", fontSize: "0.875rem" }}>
            Size: {formatFileSize(file.size)}
          </p>
        </div>
      )}

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
  error: {
    marginTop: "1rem",
    padding: "0.75rem",
    backgroundColor: "#fee2e2",
    color: "#991b1b",
    borderRadius: "4px",
    fontSize: "0.875rem",
  },
  fileInfo: {
    marginTop: "1rem",
    padding: "0.75rem",
    backgroundColor: "#f0fdf4",
    borderRadius: "4px",
    textAlign: "left",
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
