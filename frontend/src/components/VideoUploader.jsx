import React, { useState } from "react";
import { apiClient } from "../api/client";

export default function VideoUploader() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null); // { shortSummary, detailedSummary }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
      setError("");
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setError("");
    setResult(null);
    setUploading(true);

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("file", file);

      // Step 1: Upload video -> backend runs FFmpeg + Whisper -> returns transcript
      const uploadRes = await apiClient.post("/video/process", formData, {
        headers: {
          authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const { video_id, transcript } = uploadRes.data;
      setUploading(false);
      setSummarizing(true);

      // Step 2: Send transcript -> backend runs AI summarization
      const summaryRes = await apiClient.post("/summarize", {
        video_id,
        transcript,
      });

      setResult({
        shortSummary: summaryRes.data.short_summary,
        detailedSummary: summaryRes.data.detailed_summary,
      });
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          "Something went wrong while processing the video."
      );
    } finally {
      setUploading(false);
      setSummarizing(false);
    }
  };

  const busy = uploading || summarizing;
  const buttonLabel = uploading
    ? "Uploading & transcribing..."
    : summarizing
    ? "Generating summary..."
    : "Generate Summary";

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0d0e12",
        padding: "1rem",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "760px",
          backgroundColor: "#17191e",
          borderRadius: "12px",
          padding: "12px",
          border: "0.5px solid #2d3139",
          boxShadow: "0 20px 30px rgba(0, 0, 0, 0.4)",
        }}
      >
        {/* Window Controls Header */}
        <div style={{ display: "flex", gap: "6px", padding: "4px 6px 12px" }}>
          <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#3d424d" }} />
          <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#3d424d" }} />
          <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#3d424d" }} />
        </div>

        {/* Split Container */}
        <div
          style={{
            display: "flex",
            minHeight: "420px",
            borderRadius: "8px",
            overflow: "hidden",
            border: "0.5px solid #2d3139",
          }}
        >
          {/* Left Dark Branding Panel */}
          <div
            style={{
              flex: "0 0 42%",
              backgroundColor: "#111318",
              padding: "32px 28px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxSizing: "border-box",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "28px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#F0A202" }} />
                <span style={{ fontSize: "15px", fontWeight: "500", color: "#F4F3EF" }}>ClipMind</span>
              </div>
              <p style={{ fontSize: "11px", letterSpacing: "0.08em", color: "#9A9DA5", margin: "0 0 18px" }}>
                AI VIDEO SUMMARIZER
              </p>
              <p style={{ fontSize: "20px", fontWeight: "500", color: "#F4F3EF", lineHeight: "1.5", margin: 0 }}>
                Instant Insights.
                <br />
                From Any Video.
              </p>
              <p style={{ fontSize: "13px", color: "#9A9DA5", lineHeight: "1.6", margin: "16px 0 0" }}>
                Upload your file to generate time-stamped summaries, key
                takeaways, and transcripts in real time.
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "flex-end", gap: "3px", height: "40px" }}>
              <span style={{ width: "3px", height: "14px", background: "#F0A202" }} />
              <span style={{ width: "3px", height: "26px", background: "#3d3f46" }} />
              <span style={{ width: "3px", height: "18px", background: "#3d3f46" }} />
              <span style={{ width: "3px", height: "34px", background: "#F0A202" }} />
              <span style={{ width: "3px", height: "20px", background: "#3d3f46" }} />
              <span style={{ width: "3px", height: "12px", background: "#3d3f46" }} />
              <span style={{ width: "3px", height: "28px", background: "#3d3f46" }} />
              <span style={{ width: "3px", height: "16px", background: "#F0A202" }} />
              <span style={{ width: "3px", height: "24px", background: "#3d3f46" }} />
            </div>
          </div>

          {/* Right Panel */}
          <div
            style={{
              flex: "1",
              backgroundColor: "#FAF9F6",
              padding: "32px 36px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              boxSizing: "border-box",
              overflowY: "auto",
            }}
          >
            <div style={{ maxWidth: "290px", width: "100%", margin: "0 auto" }}>
              {!result ? (
                <>
                  <p style={{ fontSize: "18px", fontWeight: "500", color: "#1F2328", margin: "0 0 4px" }}>
                    Upload Video
                  </p>
                  <p style={{ fontSize: "13px", color: "#6B6F76", margin: "0 0 22px" }}>
                    Select an MP4 file to begin.
                  </p>

                  {error && (
                    <p style={{ fontSize: "12px", color: "#C0392B", margin: "0 0 12px" }}>
                      {error}
                    </p>
                  )}

                  <form onSubmit={handleUpload}>
                    <div style={{ marginBottom: "18px" }}>
                      <input
                        type="file"
                        accept="video/mp4"
                        onChange={handleFileChange}
                        style={{ display: "none" }}
                        id="video-file-input"
                      />
                      <label
                        htmlFor="video-file-input"
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "8px",
                          background: "#FFFFFF",
                          border: "1px dashed #E4E2DC",
                          borderRadius: "8px",
                          padding: "28px 16px",
                          cursor: "pointer",
                          textAlign: "center",
                        }}
                      >
                        <span style={{ fontSize: "20px", color: "#9A9DA5" }}>📁</span>
                        <span
                          style={{
                            fontSize: "12px",
                            color: file ? "#1F2328" : "#9A9DA5",
                            fontWeight: file ? "500" : "400",
                          }}
                        >
                          {file ? file.name : "Click to select video"}
                        </span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={!file || busy}
                      style={{
                        width: "100%",
                        background: !file || busy ? "#E4E2DC" : "#F0A202",
                        color: !file || busy ? "#9A9DA5" : "#412402",
                        textAlign: "center",
                        fontSize: "13px",
                        fontWeight: "500",
                        padding: "10px",
                        borderRadius: "6px",
                        border: "none",
                        cursor: !file || busy ? "not-allowed" : "pointer",
                      }}
                    >
                      {buttonLabel}
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <p style={{ fontSize: "18px", fontWeight: "500", color: "#1F2328", margin: "0 0 12px" }}>
                    Summary Ready
                  </p>
                  <p style={{ fontSize: "12px", color: "#6B6F76", margin: "0 0 4px", fontWeight: "500" }}>
                    Short Summary
                  </p>
                  <p style={{ fontSize: "13px", color: "#1F2328", margin: "0 0 16px", lineHeight: "1.5" }}>
                    {result.shortSummary}
                  </p>
                  <p style={{ fontSize: "12px", color: "#6B6F76", margin: "0 0 4px", fontWeight: "500" }}>
                    Detailed Summary
                  </p>
                  <p style={{ fontSize: "13px", color: "#1F2328", margin: "0 0 16px", lineHeight: "1.5" }}>
                    {result.detailedSummary}
                  </p>
                  <button
                    onClick={() => {
                      setResult(null);
                      setFile(null);
                    }}
                    style={{
                      width: "100%",
                      background: "#F0A202",
                      color: "#412402",
                      textAlign: "center",
                      fontSize: "13px",
                      fontWeight: "500",
                      padding: "10px",
                      borderRadius: "6px",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Upload Another
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}