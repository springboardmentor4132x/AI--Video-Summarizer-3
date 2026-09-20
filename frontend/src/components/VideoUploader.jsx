import React, { useEffect, useMemo, useRef, useState } from "react";
import { apiClient } from "../api/client";
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

// --- Robust quiz answer matching -------------------------------------
// The LLM doesn't always return correct_answer in a format that exactly
// string-matches one of the options (e.g. it may return a bare letter
// like "A", or an option that still carries a "A. " prefix). This helper
// tries several strategies before giving up, so scoring doesn't silently
// break if the model's formatting drifts.
const normalizeAnswer = (s) => (s ?? "").toString().trim().toLowerCase();

const isQuizOptionCorrect = (question, option, optionIndex) => {
  const correct = normalizeAnswer(question.correct_answer);
  if (!correct) return false;

  const opt = normalizeAnswer(option);
  if (opt === correct) return true;

  // correct_answer given as a bare letter, e.g. "A"
  const letterIndex = "abcd".indexOf(correct);
  if (letterIndex === optionIndex) return true;

  // option text still carries a letter prefix like "A. Blue" or "A) Blue"
  const strippedOption = opt.replace(/^[a-d][.):]\s*/, "");
  if (strippedOption === correct) return true;

  // correct_answer itself carries a letter prefix like "A. Blue"
  const strippedCorrect = correct.replace(/^[a-d][.):]\s*/, "");
  if (strippedCorrect && strippedCorrect === opt) return true;

  return false;
};

export default function VideoUploader({ onVideoUploaded }) {
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
  const videoUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file],
  );

  // --- Chat state ---
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // --- Quiz state ---
  const [quiz, setQuiz] = useState([]);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizError, setQuizError] = useState("");
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
    };
  }, [videoUrl]);

  const activeSegment = segments.findIndex(
    (segment) => videoTime >= segment.start && videoTime < segment.end,
  );
  const activeTopic = topics.find(
    (topic) => videoTime >= topic.start_time && videoTime < topic.end_time,
  );
  const filteredSegments = segments
    .map((segment, index) => ({ segment, index }))
    .filter(({ segment }) => {
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
      return matchesSearch && matchesTopic;
    });

  useEffect(() => {
    if (activeSegment < 0 || !transcriptRef.current) return;
    transcriptRef.current
      .querySelector(`[data-segment="${activeSegment}"]`)
      ?.scrollIntoView({
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

    if (
      !selectedFile.name.toLowerCase().endsWith(".mp4") ||
      (selectedFile.type && selectedFile.type !== "video/mp4")
    ) {
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
        err?.response?.data?.detail ||
          "Summary generation failed. Please try again.",
      );
    }
  };

  const sendChatMessage = async (e) => {
    e.preventDefault();
    const question = chatInput.trim();
    if (!question || chatLoading) return;

    setChatMessages((prev) => [...prev, { role: "user", text: question }]);
    setChatInput("");
    setChatLoading(true);

    try {
      const res = await apiClient.post("/chat", {
        video_id: videoId,
        question,
      });
      setChatMessages((prev) => [
        ...prev,
        { role: "bot", text: res.data.answer },
      ]);
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "Sorry, I couldn't answer that. Please try again.",
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const loadQuiz = async () => {
    setQuizLoading(true);
    setQuizError("");
    setQuizAnswers({});
    setQuizSubmitted(false);
    try {
      const res = await apiClient.get(`/quiz/${videoId}`);
      setQuiz(res.data.questions || []);
      setStep("quiz");
    } catch (err) {
      setQuizError(
        err?.response?.data?.detail || "Couldn't generate a quiz right now.",
      );
    } finally {
      setQuizLoading(false);
    }
  };

  const selectQuizAnswer = (questionIndex, option) => {
    if (quizSubmitted) return;
    setQuizAnswers((prev) => ({ ...prev, [questionIndex]: option }));
  };

  const quizScore = quiz.reduce((acc, q, i) => {
    const picked = quizAnswers[i];
    if (picked === undefined) return acc;
    const optIndex = q.options.indexOf(picked);
    return acc + (isQuizOptionCorrect(q, picked, optIndex) ? 1 : 0);
  }, 0);

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
    setChatMessages([]);
    setChatInput("");
    setQuiz([]);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizError("");
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
        (t) =>
          `[${formatTime(t.start_time)} - ${formatTime(t.end_time)}] Topic ${t.topic_id}: ${t.text}`,
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

  const statusBadge = (status) => {
    const map = {
      [STATUS.NOT_STARTED]: {
        text: "Not started",
        className: "text-slate-500 dark:text-slate-400",
      },
      [STATUS.PROCESSING]: {
        text: "Processing…",
        className: "text-amber-500",
      },
      [STATUS.COMPLETED]: { text: "Completed", className: "text-emerald-500" },
      [STATUS.FAILED]: { text: "Failed", className: "text-rose-500" },
    };
    const s = map[status];
    return (
      <span className={`text-xs font-bold ${s.className}`}>{s.text}</span>
    );
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
              >
                <input
                  type="file"
                  accept="video/mp4"
                  onChange={handleFileChange}
                  className="hidden"
                  id="video-file-input"
                />
                <label
                  htmlFor="video-file-input"
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
                    }}
                    className={secondaryBtnClass}
                  >
                    Clear filters
                  </button>
                )}
              </section>
            </div>

            {topics.length > 0 && (
              <>
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
                      </p>
                    </div>
                  ))}
                </div>
                <button
                  onClick={downloadHighlightReport}
                  className={secondaryBtnClass}
                >
                  <Download size={14} className="inline align-middle mr-1.5" />{" "}
                  Download Highlight Report
                </button>
              </>
            )}

            {summaryError && (
              <p className="text-xs text-rose-500 mt-3">{summaryError}</p>
            )}

            <button
              onClick={handleGenerateSummary}
              disabled={summaryStatus === STATUS.PROCESSING}
              className={`${primaryBtnClass(summaryStatus === STATUS.PROCESSING)} mt-4`}
            >
              {summaryStatus === STATUS.PROCESSING
                ? "Generating summary…"
                : summaryStatus === STATUS.FAILED
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

            <button
              onClick={handleGenerateSummary}
              disabled={summaryStatus === STATUS.PROCESSING}
              className={`${primaryBtnClass(summaryStatus === STATUS.PROCESSING)} mt-5`}
            >
              {summaryStatus === STATUS.PROCESSING
                ? "Regenerating…"
                : "Regenerate Summary"}
            </button>

            <button
              onClick={() => setStep("chat")}
              className={`${primaryBtnClass(false)} mt-2`}
            >
              💬 Chat about this video
            </button>
            <button
              onClick={loadQuiz}
              disabled={quizLoading}
              className={secondaryBtnClass}
            >
              {quizLoading ? "Generating quiz…" : "📝 Take a Quiz"}
            </button>
            {quizError && (
              <p className="text-xs text-rose-500 mt-2">{quizError}</p>
            )}

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
        )}

        {step === "chat" && (
          <div className="max-w-2xl">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Chat about this video
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-5">
              Ask anything — answers come from the transcript and summary.
            </p>

            <div className="max-h-[320px] overflow-y-auto bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg p-3 mb-3 flex flex-col gap-2.5">
              {chatMessages.length === 0 && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  No messages yet — ask a question about the video below.
                </p>
              )}
              {chatMessages.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "self-end bg-indigo-600 text-white"
                      : "self-start bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                  }`}
                >
                  {m.text}
                </div>
              ))}
              {chatLoading && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Thinking…
                </p>
              )}
            </div>

            <form onSubmit={sendChatMessage} className="flex gap-2">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask a question about this video…"
                className={`${compactInputClass} flex-1 h-10`}
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || chatLoading}
                className={`${primaryBtnClass(!chatInput.trim() || chatLoading)} w-auto px-5 mt-0`}
              >
                Send
              </button>
            </form>

            <button
              onClick={loadQuiz}
              disabled={quizLoading}
              className={secondaryBtnClass}
            >
              {quizLoading ? "Generating quiz…" : "📝 Take a Quiz"}
            </button>
            {quizError && (
              <p className="text-xs text-rose-500 mt-2">{quizError}</p>
            )}

            <button
              onClick={() => setStep("summary")}
              className={secondaryBtnClass}
            >
              Back to summary
            </button>
          </div>
        )}

        {step === "quiz" && (
          <div className="max-w-2xl">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Quiz
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-5">
              {quiz.length} questions generated from this video.
            </p>

            {quiz.map((q, i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg px-3.5 py-3 mb-2.5"
              >
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2.5">
                  {i + 1}. {q.question}
                </p>
                <div className="flex flex-col gap-1.5">
                  {q.options.map((opt, optIndex) => {
                    const isSelected = quizAnswers[i] === opt;
                    const isCorrect = isQuizOptionCorrect(q, opt, optIndex);

                    let optionClass =
                      "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700";
                    if (quizSubmitted) {
                      if (isCorrect) {
                        optionClass =
                          "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-700";
                      } else if (isSelected && !isCorrect) {
                        optionClass =
                          "bg-rose-50 dark:bg-rose-950/40 border-rose-400 dark:border-rose-700";
                      }
                    } else if (isSelected) {
                      optionClass =
                        "bg-indigo-50 dark:bg-indigo-950/30 border-indigo-400 dark:border-indigo-700";
                    }

                    return (
                      <button
                        key={optIndex}
                        type="button"
                        onClick={() => selectQuizAnswer(i, opt)}
                        className={`text-left text-xs text-slate-800 dark:text-slate-200 rounded-md px-2.5 py-2 border transition-colors duration-150 ${optionClass} ${
                          quizSubmitted ? "cursor-default" : "cursor-pointer"
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {!quizSubmitted ? (
              <button
                onClick={() => setQuizSubmitted(true)}
                disabled={Object.keys(quizAnswers).length < quiz.length}
                className={primaryBtnClass(
                  Object.keys(quizAnswers).length < quiz.length,
                )}
              >
                Submit Quiz
              </button>
            ) : (
              <p className="text-base font-bold text-indigo-500 text-center my-3">
                Score: {quizScore} / {quiz.length}
              </p>
            )}

            <button
              onClick={() => setStep("summary")}
              className={secondaryBtnClass}
            >
              Back to summary
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
