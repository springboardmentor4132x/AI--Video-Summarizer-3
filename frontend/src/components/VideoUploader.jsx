import React, { useState } from "react";
import { apiClient } from "../api/client";

const STATUS = {
  NOT_STARTED: "not_started",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
};

export default function VideoUploader() {
  const [step, setStep] = useState("upload");
  const [file, setFile] = useState(null);

  const [videoId, setVideoId] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [transcriptStatus, setTranscriptStatus] = useState(STATUS.NOT_STARTED);
  const [transcriptError, setTranscriptError] = useState("");

  const [summary, setSummary] = useState(null);
  const [summaryStatus, setSummaryStatus] = useState(STATUS.NOT_STARTED);
  const [summaryError, setSummaryError] = useState("");
  const [summaryGeneratedAt, setSummaryGeneratedAt] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setTranscriptError("");
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || transcriptStatus === STATUS.PROCESSING) return;

    setTranscriptError("");
    setTranscriptStatus(STATUS.PROCESSING);

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("file", file);

      const res = await apiClient.post("/video/process", formData, {
        headers: {
          authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setVideoId(res.data.video_id);
      setTranscript(res.data.transcript);
      setTranscriptStatus(STATUS.COMPLETED);
      setStep("transcript");
    } catch (err) {
      setTranscriptStatus(STATUS.FAILED);
      setTranscriptError(
        err?.response?.data?.detail || "Transcription failed. Please try again."
      );
    }
  };

  const handleGenerateSummary = async () => {
    if (summaryStatus === STATUS.PROCESSING) return;

    setSummaryError("");
    setSummaryStatus(STATUS.PROCESSING);

    try {
      const res = await apiClient.post("/summarize", {
        video_id: videoId,
        transcript,
      });

      setSummary({
        short: res.data.short_summary,
        detailed: res.data.detailed_summary,
      });
      setSummaryStatus(STATUS.COMPLETED);
      setSummaryGeneratedAt(new Date());
      setStep("summary");
    } catch (err) {
      setSummaryStatus(STATUS.FAILED);
      setSummaryError(
        err?.response?.data?.detail || "Summary generation failed. Please try again."
      );
    }
  };

  const resetAll = () => {
    setStep("upload");
    setFile(null);
    setVideoId(null);
    setTranscript("");
    setTranscriptStatus(STATUS.NOT_STARTED);
    setTranscriptError("");
    setSummary(null);
    setSummaryStatus(STATUS.NOT_STARTED);
    setSummaryError("");
    setSummaryGeneratedAt(null);
  };

  const cardStyle = {
    background: "var(--bg-elevated)",
    border: "1px solid var(--border)",
    borderRadius: "12px",
    padding: "32px 36px",
    maxWidth: "480px",
    margin: "0 auto",
  };
  const titleStyle = { fontSize: "20px", fontWeight: "700", color: "var(--text)", margin: "0 0 4px" };
  const subStyle = { fontSize: "13px", color: "var(--text-muted)", margin: "0 0 22px" };
  const labelStyle = { fontSize: "12px", color: "var(--text-muted)", margin: "16px 0 4px", fontWeight: "600" };
  const bodyStyle = { fontSize: "13px", color: "var(--text)", lineHeight: "1.6", margin: 0, whiteSpace: "pre-wrap" };
  const errorStyle = { fontSize: "12px", color: "var(--danger)", margin: "0 0 12px" };
  const buttonStyle = (disabled) => ({
    width: "100%",
    background: disabled ? "var(--border)" : "var(--accent)",
    color: disabled ? "var(--text-muted)" : "var(--accent-text)",
    textAlign: "center",
    fontSize: "13px",
    fontWeight: "600",
    padding: "11px",
    borderRadius: "8px",
    border: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    marginTop: "10px",
  });
  const secondaryButtonStyle = {
    width: "100%",
    background: "transparent",
    color: "var(--text-muted)",
    textAlign: "center",
    fontSize: "12px",
    fontWeight: "500",
    padding: "9px",
    borderRadius: "8px",
    border: "1px solid var(--border)",
    cursor: "pointer",
    marginTop: "8px",
  };
  const statusBadge = (status) => {
    const map = {
      [STATUS.NOT_STARTED]: { text: "Not started", color: "var(--text-muted)" },
      [STATUS.PROCESSING]: { text: "Processing…", color: "var(--warning)" },
      [STATUS.COMPLETED]: { text: "Completed", color: "var(--success)" },
      [STATUS.FAILED]: { text: "Failed", color: "var(--danger)" },
    };
    const s = map[status];
    return (
      <span style={{ fontSize: "11px", fontWeight: "700", color: s.color, letterSpacing: "0.02em" }}>
        {s.text}
      </span>
    );
  };

  return (
    <div style={{ padding: "48px 24px", minHeight: "100%" }}>
      <div style={cardStyle}>
        {/* Status tracker */}
        <div style={{ display: "flex", gap: "18px", marginBottom: "24px" }}>
          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
            Transcript: {statusBadge(transcriptStatus)}
          </span>
          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
            Summary: {statusBadge(summaryStatus)}
          </span>
        </div>

        {step === "upload" && (
          <>
            <p style={titleStyle}>Upload Video</p>
            <p style={subStyle}>Select an MP4 file to begin.</p>

            {transcriptError && <p style={errorStyle}>{transcriptError}</p>}

            <form onSubmit={handleUpload}>
              <div style={{ marginBottom: "10px" }}>
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
                    background: "var(--bg)",
                    border: "1px dashed var(--border)",
                    borderRadius: "8px",
                    padding: "36px 16px",
                    cursor: "pointer",
                    textAlign: "center",
                  }}
                >
                  <span style={{ fontSize: "22px" }}>📁</span>
                  <span
                    style={{
                      fontSize: "12px",
                      color: file ? "var(--text)" : "var(--text-muted)",
                      fontWeight: file ? "600" : "400",
                    }}
                  >
                    {file ? file.name : "Click to select video"}
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={!file || transcriptStatus === STATUS.PROCESSING}
                style={buttonStyle(!file || transcriptStatus === STATUS.PROCESSING)}
              >
                {transcriptStatus === STATUS.PROCESSING
                  ? "Uploading & transcribing…"
                  : "Generate Transcript"}
              </button>
            </form>
          </>
        )}

        {step === "transcript" && (
          <>
            <p style={titleStyle}>Transcript</p>
            <p style={subStyle}>{file?.name || "Video"}</p>

            <p style={labelStyle}>Transcript</p>
            <div
              style={{
                maxHeight: "160px",
                overflowY: "auto",
                background: "var(--bg)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                padding: "12px 14px",
              }}
            >
              <p style={bodyStyle}>{transcript || "No transcript available."}</p>
            </div>

            {summaryError && <p style={{ ...errorStyle, marginTop: "12px" }}>{summaryError}</p>}

            <button
              onClick={handleGenerateSummary}
              disabled={summaryStatus === STATUS.PROCESSING}
              style={buttonStyle(summaryStatus === STATUS.PROCESSING)}
            >
              {summaryStatus === STATUS.PROCESSING
                ? "Generating summary…"
                : summaryStatus === STATUS.FAILED
                ? "Retry Summary"
                : "Generate Summary"}
            </button>
            <button onClick={resetAll} style={secondaryButtonStyle}>
              Upload a different video
            </button>
          </>
        )}

        {step === "summary" && summary && (
          <>
            <p style={titleStyle}>Summary</p>
            <p style={subStyle}>
              {file?.name || "Video"}
              {summaryGeneratedAt && <> · Generated {summaryGeneratedAt.toLocaleTimeString()}</>}
            </p>

            <p style={labelStyle}>Short Summary</p>
            <p style={bodyStyle}>{summary.short}</p>

            <p style={labelStyle}>Detailed Summary</p>
            <p style={bodyStyle}>{summary.detailed}</p>

            <button
              onClick={handleGenerateSummary}
              disabled={summaryStatus === STATUS.PROCESSING}
              style={buttonStyle(summaryStatus === STATUS.PROCESSING)}
            >
              {summaryStatus === STATUS.PROCESSING ? "Regenerating…" : "Regenerate Summary"}
            </button>
            <button onClick={() => setStep("transcript")} style={secondaryButtonStyle}>
              Back to transcript
            </button>
            <button onClick={resetAll} style={secondaryButtonStyle}>
              Upload a different video
            </button>
          </>
        )}
      </div>
    </div>
  );
}