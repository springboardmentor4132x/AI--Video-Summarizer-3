import React, { useEffect, useMemo, useRef, useState } from "react";
import { apiClient } from "../api/client";
<<<<<<< HEAD
import {
  Check,
  Download,
  FileVideo,
  Pause,
  Play,
  RotateCcw,
  Search,
  Upload,
  Volume2,
  X,
} from "lucide-react";

const STATUS = {
  NOT_STARTED: "not_started",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
};

export default function VideoUploader({ onVideoUploaded }) {
=======
import { Check, Download, FileVideo, Pause, Play, RotateCcw, Search, Upload, Volume2, X } from "lucide-react";

const STATUS = {
  NOT_STARTED: "not_started",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
};

export default function VideoUploader() {
>>>>>>> 6405c7b05fdff16e70d270d71c6b9e81127d6f7e
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
<<<<<<< HEAD
  const videoUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file],
  );
=======
  const videoUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
>>>>>>> 6405c7b05fdff16e70d270d71c6b9e81127d6f7e

  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
    };
  }, [videoUrl]);

  const activeSegment = segments.findIndex(
<<<<<<< HEAD
    (segment) => videoTime >= segment.start && videoTime < segment.end,
  );
  const activeTopic = topics.find(
    (topic) => videoTime >= topic.start_time && videoTime < topic.end_time,
=======
    (segment) => videoTime >= segment.start && videoTime < segment.end
  );
  const activeTopic = topics.find(
    (topic) => videoTime >= topic.start_time && videoTime < topic.end_time
>>>>>>> 6405c7b05fdff16e70d270d71c6b9e81127d6f7e
  );
  const filteredSegments = segments
    .map((segment, index) => ({ segment, index }))
    .filter(({ segment }) => {
<<<<<<< HEAD
      const matchesSearch =
        !transcriptSearch.trim() ||
        segment.text
          .toLowerCase()
          .includes(transcriptSearch.trim().toLowerCase());
      const selectedTopic = topics.find(
        (topic) => String(topic.topic_id) === topicFilter,
      );
      const matchesTopic =
        topicFilter === "all" ||
        (selectedTopic &&
          segment.start >= selectedTopic.start_time &&
          segment.end <= selectedTopic.end_time);
=======
      const matchesSearch = !transcriptSearch.trim()
        || segment.text.toLowerCase().includes(transcriptSearch.trim().toLowerCase());
      const selectedTopic = topics.find((topic) => String(topic.topic_id) === topicFilter);
      const matchesTopic = topicFilter === "all"
        || (selectedTopic && segment.start >= selectedTopic.start_time && segment.end <= selectedTopic.end_time);
>>>>>>> 6405c7b05fdff16e70d270d71c6b9e81127d6f7e
      return matchesSearch && matchesTopic;
    });

  useEffect(() => {
    if (activeSegment < 0 || !transcriptRef.current) return;
<<<<<<< HEAD
    transcriptRef.current
      .querySelector(`[data-segment="${activeSegment}"]`)
      ?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
=======
    transcriptRef.current.querySelector(`[data-segment="${activeSegment}"]`)?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
>>>>>>> 6405c7b05fdff16e70d270d71c6b9e81127d6f7e
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

<<<<<<< HEAD
    if (
      !selectedFile.name.toLowerCase().endsWith(".mp4") ||
      (selectedFile.type && selectedFile.type !== "video/mp4")
    ) {
=======
    if (!selectedFile.name.toLowerCase().endsWith(".mp4") || (selectedFile.type && selectedFile.type !== "video/mp4")) {
>>>>>>> 6405c7b05fdff16e70d270d71c6b9e81127d6f7e
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
<<<<<<< HEAD

      if (onVideoUploaded) {
        onVideoUploaded(res.data.video_id);
      }
    } catch (err) {
      setTranscriptStatus(STATUS.FAILED);
      if (err?.response?.status === 401) {
        setTranscriptError(
          "Your session expired. Please log out and log in again.",
        );
      } else {
        setTranscriptError(
          err?.response?.data?.detail ||
            "Transcription failed. Please try again.",
=======
    } catch (err) {
      setTranscriptStatus(STATUS.FAILED);
      if (err?.response?.status === 401) {
        setTranscriptError("Your session expired. Please log out and log in again.");
      } else {
        setTranscriptError(
          err?.response?.data?.detail || "Transcription failed. Please try again."
>>>>>>> 6405c7b05fdff16e70d270d71c6b9e81127d6f7e
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
<<<<<<< HEAD
        err?.response?.data?.detail ||
          "Summary generation failed. Please try again.",
=======
        err?.response?.data?.detail || "Summary generation failed. Please try again."
>>>>>>> 6405c7b05fdff16e70d270d71c6b9e81127d6f7e
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
<<<<<<< HEAD
        (t) =>
          `[${formatTime(t.start_time)} - ${formatTime(t.end_time)}] Topic ${t.topic_id}: ${t.text}`,
=======
        (t) => `[${formatTime(t.start_time)} - ${formatTime(t.end_time)}] Topic ${t.topic_id}: ${t.text}`
>>>>>>> 6405c7b05fdff16e70d270d71c6b9e81127d6f7e
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

<<<<<<< HEAD
  const statusBadge = (status) => {
    const map = {
      [STATUS.NOT_STARTED]: {
        text: "Not started",
        className: "text-slate-500 dark:text-slate-400",
      },
      [STATUS.PROCESSING]: { text: "Processing…", className: "text-amber-500" },
      [STATUS.COMPLETED]: { text: "Completed", className: "text-emerald-500" },
      [STATUS.FAILED]: { text: "Failed", className: "text-rose-500" },
    };
    const s = map[status];
    return <span className={`text-xs font-bold ${s.className}`}>{s.text}</span>;
  };

  const primaryBtnClass = (disabled) =>
    `w-full text-center text-sm font-semibold py-3 rounded-xl transition-all duration-150 ${
      disabled
        ? "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed"
        : "bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/20"
    }`;
  const secondaryBtnClass =
    "w-full text-center text-sm font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 mt-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-150";
  const iconBtnClass =
    "w-9 h-9 inline-flex items-center justify-center bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-150";
  const compactInputClass =
    "h-9 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 text-xs outline-none focus:border-indigo-500";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      <div className="flex items-center gap-6 px-8 pt-6 pb-2 text-sm text-slate-500 dark:text-slate-400">
        <span>Transcript: {statusBadge(transcriptStatus)}</span>
        <span>Summary: {statusBadge(summaryStatus)}</span>
      </div>

      <div className="flex-1 px-8 pb-8 pt-4 flex flex-col min-h-0">
        {step === "upload" && (
          <div className="flex-1 flex flex-col min-h-0 max-w-4xl">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Upload Video
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Drop an MP4 here or browse your computer. Maximum size: 100 MB.
            </p>

            {(fileError || transcriptError) && (
              <div className="flex items-start gap-2 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-lg px-3 py-2.5 mt-4">
                <X size={15} className="text-rose-500 shrink-0 mt-0.5" />
                <p className="text-xs text-rose-600 dark:text-rose-400">
                  {fileError || transcriptError}
                </p>
              </div>
            )}

            <form
              onSubmit={handleUpload}
              className="flex-1 flex flex-col min-h-0 mt-4"
            >
              <div
                onDragOver={(event) => {
                  event.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className="flex-1 flex min-h-0"
=======
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
>>>>>>> 6405c7b05fdff16e70d270d71c6b9e81127d6f7e
              >
                <input
                  type="file"
                  accept="video/mp4"
                  onChange={handleFileChange}
<<<<<<< HEAD
                  className="hidden"
=======
                  style={{ display: "none" }}
>>>>>>> 6405c7b05fdff16e70d270d71c6b9e81127d6f7e
                  id="video-file-input"
                />
                <label
                  htmlFor="video-file-input"
<<<<<<< HEAD
                  className={`flex-1 flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed cursor-pointer text-center transition-colors duration-150 min-h-[260px] ${
                    isDragging
                      ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30"
                      : "border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                  }`}
                >
                  <Upload size={40} className="text-indigo-500" />
                  <span
                    className={`text-base ${file ? "font-semibold text-slate-800 dark:text-slate-100" : "text-slate-500 dark:text-slate-400"}`}
                  >
                    {file
                      ? file.name
                      : isDragging
                        ? "Release to add video"
                        : "Drag and drop your MP4 here"}
                  </span>
                  {!file && (
                    <span className="text-sm text-slate-400">
                      or click to browse files
                    </span>
                  )}
                </label>
              </div>

              {file && !fileError && (
                <div className="flex items-center gap-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2.5 mt-3">
                  <FileVideo size={18} className="text-indigo-500 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {file.name}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {formatFileSize(file.size)} · MP4 video ready
                    </p>
                  </div>
                  <Check size={16} className="text-emerald-500" />
                </div>
              )}

              {transcriptStatus === STATUS.PROCESSING && (
                <div className="mt-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
                  <div className="flex justify-between gap-3 mb-2.5">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Preparing your analysis
                    </span>
                    <span className="text-[11px] text-slate-400">
                      This may take a moment
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1 mb-2.5">
                    {["Upload", "Extract audio", "Transcribe", "Analyze"].map(
                      (stage, index) => (
                        <div
                          key={stage}
                          className={`h-1 rounded-full transition-colors duration-300 ${
                            index <= processingStage
                              ? "bg-indigo-600"
                              : "bg-slate-200 dark:bg-slate-800"
                          }`}
                        />
                      ),
                    )}
                  </div>
                  <p className="text-[11px] text-indigo-500 font-semibold">
                    {
                      [
                        "Uploading video…",
                        "Extracting audio…",
                        "Transcribing speech…",
                        "Finding key moments…",
                      ][processingStage]
                    }
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={!file || transcriptStatus === STATUS.PROCESSING}
                className={`${primaryBtnClass(!file || transcriptStatus === STATUS.PROCESSING)} mt-4`}
              >
                {transcriptStatus === STATUS.PROCESSING
                  ? "Processing video…"
                  : transcriptStatus === STATUS.FAILED
                    ? "Retry processing"
                    : "Generate Transcript"}
              </button>
            </form>
          </div>
        )}

        {step === "transcript" && (
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Transcript
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-5">
              {file?.name || "Video"} · {formatFileSize(file?.size)}
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              <section>
                <div className="bg-black rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    controls
                    onTimeUpdate={(event) =>
                      setVideoTime(event.currentTarget.currentTime)
                    }
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => setIsPlaying(false)}
                    className="block w-full max-h-[420px] bg-black"
                  />
                  <div className="flex items-center gap-2.5 px-3 py-2.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={togglePlayback}
                      className={iconBtnClass}
                      aria-label={isPlaying ? "Pause video" : "Play video"}
                    >
                      {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                    </button>
                    <Volume2 size={16} className="text-slate-400" />
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {formatTime(videoTime)}
                    </span>
                    <span className="ml-auto text-[11px] text-slate-400">
                      Click a transcript line to jump
                    </span>
                  </div>
                </div>

                {keywords.length > 0 && (
                  <>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-4 mb-1.5">
                      Keywords
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {keywords.map((kw) => (
                        <button
                          key={kw}
                          type="button"
                          onClick={() => {
                            setTranscriptSearch(kw);
                            setTopicFilter("all");
                          }}
                          className="text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 px-2.5 py-1 rounded-full transition-colors duration-150"
                        >
                          {kw}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </section>

              <section>
                <div className="flex items-center justify-between gap-3 mb-2">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Timestamped transcript
                  </p>
                  <span className="text-[10px] text-slate-400">
                    {filteredSegments.length}/{segments.length} lines
                  </span>
                </div>
                <div className="flex gap-2 mb-2">
                  <div className="relative flex-1">
                    <Search
                      size={14}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      value={transcriptSearch}
                      onChange={(event) =>
                        setTranscriptSearch(event.target.value)
                      }
                      placeholder="Search transcript"
                      aria-label="Search transcript"
                      className={`${compactInputClass} w-full pl-8`}
                    />
                  </div>
                  {transcriptSearch && (
                    <button
                      type="button"
                      onClick={() => setTranscriptSearch("")}
                      className={`${iconBtnClass} w-9 h-9`}
                      aria-label="Clear transcript search"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
                {topics.length > 0 && (
                  <select
                    value={topicFilter}
                    onChange={(event) => setTopicFilter(event.target.value)}
                    aria-label="Filter transcript by topic"
                    className={`${compactInputClass} w-full mb-2`}
                  >
                    <option value="all">All topics</option>
                    {topics.map((topic) => (
                      <option key={topic.topic_id} value={topic.topic_id}>
                        Topic {topic.topic_id} · {formatTime(topic.start_time)}{" "}
                        - {formatTime(topic.end_time)}
                      </option>
                    ))}
                  </select>
                )}
                <div
                  ref={transcriptRef}
                  className="max-h-[390px] overflow-y-auto bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg p-2"
                >
                  {filteredSegments.length > 0 ? (
                    filteredSegments.map(({ segment, index }) => (
                      <button
                        type="button"
                        key={`${segment.start}-${index}`}
                        data-segment={index}
                        onClick={() => seekTo(segment.start)}
                        className={`block w-full text-left rounded px-2.5 py-2 transition-colors duration-150 border-l-4 ${
                          activeSegment === index
                            ? "bg-indigo-500/10 border-indigo-500"
                            : "bg-transparent border-transparent hover:bg-slate-100 dark:hover:bg-slate-800/50"
                        }`}
                      >
                        <span className="block text-[10px] font-bold text-indigo-500 mb-0.5">
                          {formatTime(segment.start)} –{" "}
                          {formatTime(segment.end)}
                        </span>
                        <span className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                          {segment.text}
                        </span>
                      </button>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      No timestamped transcript available.
                    </p>
                  )}
                </div>
                {segments.length > 0 && filteredSegments.length === 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setTranscriptSearch("");
                      setTopicFilter("all");
=======
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
>>>>>>> 6405c7b05fdff16e70d270d71c6b9e81127d6f7e
                    }}
                    className={secondaryBtnClass}
                  >
<<<<<<< HEAD
=======
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
>>>>>>> 6405c7b05fdff16e70d270d71c6b9e81127d6f7e
                    Clear filters
                  </button>
                )}
              </section>
            </div>

            {topics.length > 0 && (
              <>
<<<<<<< HEAD
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-5 mb-2">
                  Key Moments ({topics.length} topics)
                  {activeTopic
                    ? ` · Topic ${activeTopic.topic_id} playing`
                    : ""}
                </p>
                <div className="flex flex-col gap-2 mb-2 max-h-[180px] overflow-y-auto">
                  {topics.map((topic) => (
                    <div
                      key={topic.topic_id}
                      className={`rounded-lg px-3 py-2 border transition-colors duration-150 ${
                        activeTopic?.topic_id === topic.topic_id
                          ? "bg-indigo-50 dark:bg-indigo-950/30 border-indigo-300 dark:border-indigo-800"
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setTopicFilter(String(topic.topic_id));
                          setTranscriptSearch("");
                          seekTo(topic.start_time);
                        }}
                        className="block bg-transparent border-none p-0 text-xs font-bold text-indigo-500 mb-0.5 cursor-pointer"
                      >
                        {formatTime(topic.start_time)} –{" "}
                        {formatTime(topic.end_time)} · Topic {topic.topic_id}
                      </button>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                        {topic.text.length > 140
                          ? topic.text.slice(0, 140) + "…"
                          : topic.text}
=======
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
>>>>>>> 6405c7b05fdff16e70d270d71c6b9e81127d6f7e
                      </p>
                    </div>
                  ))}
                </div>
<<<<<<< HEAD
                <button
                  onClick={downloadHighlightReport}
                  className={secondaryBtnClass}
                >
                  <Download size={14} className="inline align-middle mr-1.5" />{" "}
                  Download Highlight Report
=======
                <button onClick={downloadHighlightReport} style={secondaryButtonStyle}>
                  <Download size={14} style={{ verticalAlign: "middle", marginRight: "6px" }} /> Download Highlight Report
>>>>>>> 6405c7b05fdff16e70d270d71c6b9e81127d6f7e
                </button>
              </>
            )}

<<<<<<< HEAD
            {summaryError && (
              <p className="text-xs text-rose-500 mt-3">{summaryError}</p>
            )}
=======
            {summaryError && <p style={{ ...errorStyle, marginTop: "12px" }}>{summaryError}</p>}
>>>>>>> 6405c7b05fdff16e70d270d71c6b9e81127d6f7e

            <button
              onClick={handleGenerateSummary}
              disabled={summaryStatus === STATUS.PROCESSING}
<<<<<<< HEAD
              className={`${primaryBtnClass(summaryStatus === STATUS.PROCESSING)} mt-4`}
=======
              style={buttonStyle(summaryStatus === STATUS.PROCESSING)}
>>>>>>> 6405c7b05fdff16e70d270d71c6b9e81127d6f7e
            >
              {summaryStatus === STATUS.PROCESSING
                ? "Generating summary…"
                : summaryStatus === STATUS.FAILED
<<<<<<< HEAD
                  ? "Retry Summary"
                  : "Generate Summary"}
            </button>
            <button onClick={resetAll} className={secondaryBtnClass}>
              <RotateCcw size={14} className="inline align-middle mr-1.5" />{" "}
              Upload a different video
            </button>
          </div>
        )}

        {step === "summary" && summary && (
          <div className="max-w-2xl">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Summary
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-5">
              {file?.name || "Video"}
              {summaryGeneratedAt && (
                <> · Generated {summaryGeneratedAt.toLocaleTimeString()}</>
              )}
            </p>

            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-4 mb-1">
              Short Summary
            </p>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {summary.short}
            </p>

            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-4 mb-1">
              Detailed Summary
            </p>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {summary.detailed}
            </p>
=======
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
>>>>>>> 6405c7b05fdff16e70d270d71c6b9e81127d6f7e

            <button
              onClick={handleGenerateSummary}
              disabled={summaryStatus === STATUS.PROCESSING}
<<<<<<< HEAD
              className={`${primaryBtnClass(summaryStatus === STATUS.PROCESSING)} mt-5`}
            >
              {summaryStatus === STATUS.PROCESSING
                ? "Regenerating…"
                : "Regenerate Summary"}
            </button>
            <button
              onClick={downloadHighlightReport}
              className={secondaryBtnClass}
            >
              <Download size={14} className="inline align-middle mr-1.5" />{" "}
              Download Highlight Report
            </button>
            <button
              onClick={() => setStep("transcript")}
              className={secondaryBtnClass}
            >
              Back to transcript
            </button>
            <button onClick={resetAll} className={secondaryBtnClass}>
              Upload a different video
            </button>
          </div>
=======
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
>>>>>>> 6405c7b05fdff16e70d270d71c6b9e81127d6f7e
        )}
      </div>
    </div>
  );
}
