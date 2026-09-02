import React, { useState, useEffect } from "react";
import { apiClient } from "../api/client";

export function UploadHistory() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchVideos = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get("/videos/me");
      setVideos(response.data.videos);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to fetch upload history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString() + " " + new Date(dateString).toLocaleTimeString();
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "uploaded":
        return { backgroundColor: "#3b82f6", color: "white" };
      case "processing":
        return { backgroundColor: "#f59e0b", color: "white" };
      case "done":
        return { backgroundColor: "#10b981", color: "white" };
      default:
        return { backgroundColor: "#6b7280", color: "white" };
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3>Upload History</h3>
        <button onClick={fetchVideos} disabled={loading} style={styles.refreshBtn}>
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {loading ? (
        <p style={styles.centered}>Loading your uploads...</p>
      ) : videos.length === 0 ? (
        <p style={styles.centered}>No uploads yet. Start by uploading a video!</p>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Filename</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Uploaded</th>
              </tr>
            </thead>
            <tbody>
              {videos.map((video) => (
                <tr key={video.id} style={styles.tr}>
                  <td style={styles.td}>{video.filename}</td>
                  <td style={styles.td}>
                    <span style={{ ...styles.badge, ...getStatusBadgeColor(video.status) }}>
                      {video.status}
                    </span>
                  </td>
                  <td style={styles.td}>{formatDate(video.uploaded_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
    marginTop: "1.5rem",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
  },
  refreshBtn: {
    padding: "0.5rem 1rem",
    backgroundColor: "#059669",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "0.875rem",
  },
  error: {
    padding: "1rem",
    backgroundColor: "#fee2e2",
    color: "#991b1b",
    borderRadius: "4px",
    marginBottom: "1rem",
  },
  centered: {
    textAlign: "center",
    color: "#6b7280",
    padding: "2rem",
  },
  tableContainer: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    padding: "0.75rem",
    textAlign: "left",
    backgroundColor: "#f3f4f6",
    fontWeight: "600",
    borderBottom: "2px solid #d1d5db",
  },
  tr: {
    borderBottom: "1px solid #e5e7eb",
  },
  td: {
    padding: "0.75rem",
  },
  badge: {
    padding: "0.25rem 0.75rem",
    borderRadius: "9999px",
    fontSize: "0.875rem",
    fontWeight: "500",
  },
};
