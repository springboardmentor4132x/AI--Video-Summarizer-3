import React, { useEffect, useMemo, useRef, useState } from "react";
import { apiClient } from "../api/client";
import { Check, Download, FileVideo, Pause, Play, RotateCcw, Search, Upload, Volume2, X } from "lucide-react";

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
  const [segments, setSegments] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoTime, setVideoTime] = useState(0);
  const [topics, setTopics] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [transcriptStatus, setTranscriptStatus] = useState(STATUS.NOT_STARTED);
  const [transcriptError, setTranscriptError] = useState("");

  const [summary, setSummary] = useState(null);
  const [summaryStatus, setSummaryStatus] = useState(STATUS.NOT_STARTED);
  const [summaryError, setSummaryError] = useState("");
  const [summaryGeneratedAt, setSummaryGeneratedAt] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState("");
  const [processingStage, setProcessingStage] = useState(0);
  const [transcriptSearch, setTranscriptSearch] = useState("");
  const [topicFilter, setTopicFilter] = useState("all");
  const videoRef = useRef(null);
  const transcriptRef = useRef(null);
  const videoUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
    };
  }, [videoUrl]);

  const activeSegment = segments.findIndex(
    (segment) => videoTime >= segment.start && videoTime < segment.end
  );
  const activeTopic = topics.find(
    (topic) => videoTime >= topic.start_time && videoTime < topic.end_time
  );
  const filteredSegments = segments
    .map((segment, index) => ({ segment, index }))
    .filter(({ segment }) => {
      const matchesSearch = !transcriptSearch.trim()
        || segment.text.toLowerCase().includes(transcriptSearch.trim().toLowerCase());
      const selectedTopic = topics.find((topic) => String(topic.topic_id) === topicFilter);
      const matchesTopic = topicFilter === "all"
        || (selectedTopic && segment.start >= selectedTopic.start_time && segment.end <= selectedTopic.end_time);
      return matchesSearch && matchesTopic;
    });

  useEffect(() => {
    if (activeSegment < 0 || !transcriptRef.current) return;
    transcriptRef.current.querySelector(`[data-segment="${activeSegment}"]`)?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [activeSegment]);

  useEffect(() => {
    if (transcriptStatus !== STATUS.PROCESSING) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setProcessingStage((current) => Math.min(current + 1, 3));
    }, 1800);

    return () => window.clearInterval(timer);
  }, [transcriptStatus]);

  const validateAndSetFile = (selectedFile) => {
    setFileError("");
    if (!selectedFile) return;

    if (!selectedFile.name.toLowerCase().endsWith(".mp4") || (selectedFile.type && selectedFile.type !== "video/mp4")) {
      setFile(null);
      setFileError("Please choose an MP4 video file.");
      return;
    }

    if (selectedFile.size > 100 * 1024 * 1024) {
      setFile(null);
      setFileError("This video is larger than the 100 MB limit.");
      return;
    }

    setFile(selectedFile);
    setTranscriptError("");
    setSummaryError("");
    setProcessingStage(0);
    setTranscriptSearch("");
    setTopicFilter("all");
  };

  const handleFileChange = (e) => {
    validateAndSetFile(e.target.files?.[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    validateAndSetFile(e.dataTransfer.files?.[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || transcriptStatus === STATUS.PROCESSING) return;

    setTranscriptError("");
    setProcessingStage(0);
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
      setSegments(res.data.segments || []);
      setTopics(res.data.topics || []);
      setKeywords(res.data.keywords || []);
      setTranscriptStatus(STATUS.COMPLETED);
      setStep("transcript");
    } catch (err) {
      setTranscriptStatus(STATUS.FAILED);
      if (err?.response?.status === 401) {
        setTranscriptError("Your session expired. Please log out and log in again.");
      } else {
        setTranscriptError(
          err?.response?.data?.detail || "Transcription failed. Please try again."
        );
      }
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
    setSegments([]);
    setIsPlaying(false);
    setVideoTime(0);
    setTopics([]);
    setKeywords([]);
    setTranscriptStatus(STATUS.NOT_STARTED);
    setTranscriptError("");
    setSummary(null);
    setSummaryStatus(STATUS.NOT_STARTED);
    setSummaryError("");
    setSummaryGeneratedAt(null);
    setProcessingStage(0);
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 MB";
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const seekTo = (time) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = time;
    videoRef.current.play();
    setIsPlaying(true);
  };

  const togglePlayback = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const downloadHighlightReport = () => {
    const lines = [
      `Highlight Report — ${file?.name || "video"}`,
      `Generated: ${new Date().toLocaleString()}`,
      "",
      `Keywords: ${keywords.join(", ")}`,
      "",
      "Key Moments:",
      ...topics.map(
        (t) => `[${formatTime(t.start_time)} - ${formatTime(t.end_time)}] Topic ${t.topic_id}: ${t.text}`
      ),
      "",
      "Summary:",
      summary ? `Short: ${summary.short}` : "(not generated yet)",
      summary ? `Detailed: ${summary.detailed}` : "",
    ];

    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `highlight-report-${videoId || "video"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
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
  const iconButtonStyle = {
    width: "36px",
    height: "36px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: "var(--bg)",
    color: "var(--text)",
    border: "1px solid var(--border)",
    borderRadius: "8px",
    cursor: "pointer",
  };
  const compactControlStyle = {
    height: "34px",
    background: "var(--bg)",
    color: "var(--text)",
    border: "1px solid var(--border)",
    borderRadius: "7px",
    padding: "0 10px",
    fontSize: "11px",
    outline: "none",
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
    <div style={{ padding: "32px 24px", minHeight: "100%" }}>
      <div style={{ ...cardStyle, maxWidth: step === "upload" ? "480px" : "1180px" }}>
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
            <p style={subStyle}>Drop an MP4 here or browse your computer. Maximum size: 100 MB.</p>

            {(fileError || transcriptError) && (
              <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", background: "color-mix(in srgb, var(--danger) 10%, transparent)", border: "1px solid color-mix(in srgb, var(--danger) 30%, transparent)", borderRadius: "8px", padding: "10px 12px", marginBottom: "14px" }}>
                <X size={15} color="var(--danger)" style={{ flexShrink: 0, marginTop: "1px" }} />
                <p style={{ ...errorStyle, margin: 0 }}>{fileError || transcriptError}</p>
              </div>
            )}

            <form onSubmit={handleUpload}>
              <div
                onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                style={{ marginBottom: "10px" }}
              >
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
                    background: isDragging ? "var(--accent-bg)" : "var(--bg)",
                    border: isDragging ? "1px dashed var(--accent)" : "1px dashed var(--border)",
                    borderRadius: "8px",
                    padding: "30px 16px",
                    cursor: "pointer",
                    textAlign: "center",
                    transition: "background 160ms ease, border-color 160ms ease",
                  }}
                >
                  <Upload size={23} color="var(--accent)" />
                  <span
                    style={{
                      fontSize: "12px",
                      color: file ? "var(--text)" : "var(--text-muted)",
                      fontWeight: file ? "600" : "400",
                    }}
                  >
                    {file ? file.name : isDragging ? "Release to add video" : "Drag and drop your MP4 here"}
                  </span>
                  {!file && <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>or click to browse files</span>}
                </label>
              </div>

              {file && !fileError && (
                <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "8px", padding: "10px 12px", marginBottom: "10px" }}>
                  <FileVideo size={18} color="var(--accent)" style={{ flexShrink: 0 }} />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ fontSize: "12px", fontWeight: "600", color: "var(--text)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</p>
                    <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: "3px 0 0" }}>{formatFileSize(file.size)} · MP4 video ready</p>
                  </div>
                  <Check size={16} color="var(--success)" />
                </div>
              )}

              {transcriptStatus === STATUS.PROCESSING && (
                <div style={{ margin: "14px 0 4px", padding: "12px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", marginBottom: "10px" }}>
                    <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--text)" }}>Preparing your analysis</span>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>This may take a moment</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "4px", marginBottom: "10px" }}>
                    {["Upload", "Extract audio", "Transcribe", "Analyze"].map((stage, index) => (
                      <div key={stage} style={{ height: "4px", borderRadius: "4px", background: index <= processingStage ? "var(--accent)" : "var(--border)", transition: "background 300ms ease" }} />
                    ))}
                  </div>
                  <p style={{ fontSize: "11px", color: "var(--accent)", margin: 0 }}>{["Uploading video…", "Extracting audio…", "Transcribing speech…", "Finding key moments…"][processingStage]}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={!file || transcriptStatus === STATUS.PROCESSING}
                style={buttonStyle(!file || transcriptStatus === STATUS.PROCESSING)}
              >
                {transcriptStatus === STATUS.PROCESSING ? "Processing video…" : transcriptStatus === STATUS.FAILED ? "Retry processing" : "Generate Transcript"}
              </button>
            </form>
          </>
        )}

        {step === "transcript" && (
          <>
            <p style={titleStyle}>Transcript</p>
            <p style={subStyle}>{file?.name || "Video"} · {formatFileSize(file?.size)}</p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", alignItems: "start" }}>
              <section>
                <div style={{ background: "#101418", borderRadius: "10px", overflow: "hidden", border: "1px solid var(--border)" }}>
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    controls
                    onTimeUpdate={(event) => setVideoTime(event.currentTarget.currentTime)}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => setIsPlaying(false)}
                    style={{ display: "block", width: "100%", maxHeight: "420px", background: "#101418" }}
                  />
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px" }}>
                    <button type="button" onClick={togglePlayback} style={iconButtonStyle} aria-label={isPlaying ? "Pause video" : "Play video"}>
                      {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                    </button>
                    <Volume2 size={16} color="var(--text-muted)" />
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{formatTime(videoTime)}</span>
                    <span style={{ marginLeft: "auto", fontSize: "11px", color: "var(--text-muted)" }}>Click a transcript line to jump</span>
                  </div>
                </div>

                {keywords.length > 0 && (
                  <>
                    <p style={labelStyle}>Keywords</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "4px" }}>
                      {keywords.map((kw) => (
                        <button key={kw} type="button" onClick={() => { setTranscriptSearch(kw); setTopicFilter("all"); }} style={{ fontSize: "11px", fontWeight: "600", color: "var(--accent-text)", background: "var(--accent)", padding: "3px 9px", borderRadius: "12px", border: "none", cursor: "pointer" }}>{kw}</button>
                      ))}
                    </div>
                  </>
                )}
              </section>

              <section>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", margin: "16px 0 8px" }}>
                  <p style={{ ...labelStyle, margin: 0 }}>Timestamped transcript</p>
                  <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>{filteredSegments.length}/{segments.length} lines</span>
                </div>
                <div style={{ display: "flex", gap: "7px", marginBottom: "8px" }}>
                  <div style={{ position: "relative", flex: 1 }}>
                    <Search size={14} color="var(--text-muted)" style={{ position: "absolute", left: "10px", top: "10px" }} />
                    <input
                      value={transcriptSearch}
                      onChange={(event) => setTranscriptSearch(event.target.value)}
                      placeholder="Search transcript"
                      aria-label="Search transcript"
                      style={{ ...compactControlStyle, width: "100%", paddingLeft: "30px" }}
                    />
                  </div>
                  {transcriptSearch && (
                    <button type="button" onClick={() => setTranscriptSearch("")} style={{ ...iconButtonStyle, width: "34px", height: "34px" }} aria-label="Clear transcript search">
                      <X size={14} />
                    </button>
                  )}
                </div>
                {topics.length > 0 && (
                  <select value={topicFilter} onChange={(event) => setTopicFilter(event.target.value)} aria-label="Filter transcript by topic" style={{ ...compactControlStyle, width: "100%", marginBottom: "8px" }}>
                    <option value="all">All topics</option>
                    {topics.map((topic) => <option key={topic.topic_id} value={topic.topic_id}>Topic {topic.topic_id} · {formatTime(topic.start_time)} - {formatTime(topic.end_time)}</option>)}
                  </select>
                )}
                <div ref={transcriptRef} style={{ maxHeight: "390px", overflowY: "auto", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "8px", padding: "8px" }}>
                  {filteredSegments.length > 0 ? filteredSegments.map(({ segment, index }) => (
                    <button
                      type="button"
                      key={`${segment.start}-${index}`}
                      data-segment={index}
                      onClick={() => seekTo(segment.start)}
                      style={{ display: "block", width: "100%", textAlign: "left", background: activeSegment === index ? "var(--accent-bg)" : "transparent", border: "none", borderLeft: activeSegment === index ? "3px solid var(--accent)" : "3px solid transparent", borderRadius: "4px", padding: "9px 10px", cursor: "pointer", transition: "background 160ms ease, border-color 160ms ease" }}
                    >
                      <span style={{ display: "block", fontSize: "10px", fontWeight: "700", color: "var(--accent)", marginBottom: "3px" }}>{formatTime(segment.start)} – {formatTime(segment.end)}</span>
                      <span style={{ fontSize: "12px", lineHeight: "1.5", color: "var(--text)" }}>{segment.text}</span>
                    </button>
                  )) : <p style={bodyStyle}>No timestamped transcript available.</p>}
                </div>
                {segments.length > 0 && filteredSegments.length === 0 && (
                  <button type="button" onClick={() => { setTranscriptSearch(""); setTopicFilter("all"); }} style={{ ...secondaryButtonStyle, marginTop: "8px" }}>
                    Clear filters
                  </button>
                )}
              </section>
            </div>

            {topics.length > 0 && (
              <>
                <p style={labelStyle}>Key Moments ({topics.length} topics){activeTopic ? ` · Topic ${activeTopic.topic_id} playing` : ""}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "8px", maxHeight: "180px", overflowY: "auto" }}>
                  {topics.map((topic) => (
                    <div
                      key={topic.topic_id}
                      style={{
                        background: activeTopic?.topic_id === topic.topic_id ? "var(--accent-bg)" : "var(--bg)",
                        border: activeTopic?.topic_id === topic.topic_id ? "1px solid var(--accent)" : "1px solid var(--border)",
                        borderRadius: "6px",
                        padding: "8px 10px",
                        transition: "background 160ms ease, border-color 160ms ease",
                      }}
                    >
                      <button type="button" onClick={() => { setTopicFilter(String(topic.topic_id)); setTranscriptSearch(""); seekTo(topic.start_time); }} style={{ display: "block", background: "none", border: "none", padding: 0, fontSize: "11px", fontWeight: "700", color: "var(--accent)", margin: "0 0 3px", cursor: "pointer" }}>
                        {formatTime(topic.start_time)} – {formatTime(topic.end_time)} · Topic {topic.topic_id}
                      </button>
                      <p style={{ fontSize: "12px", color: "var(--text)", margin: 0, lineHeight: "1.4" }}>
                        {topic.text.length > 140 ? topic.text.slice(0, 140) + "…" : topic.text}
                      </p>
                    </div>
                  ))}
                </div>
                <button onClick={downloadHighlightReport} style={secondaryButtonStyle}>
                  <Download size={14} style={{ verticalAlign: "middle", marginRight: "6px" }} /> Download Highlight Report
                </button>
              </>
            )}

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
              <RotateCcw size={14} style={{ verticalAlign: "middle", marginRight: "6px" }} /> Upload a different video
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
            <button onClick={downloadHighlightReport} style={secondaryButtonStyle}>
              ⬇ Download Highlight Report
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