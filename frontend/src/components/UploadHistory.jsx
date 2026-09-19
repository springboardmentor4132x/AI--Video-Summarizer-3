<<<<<<< HEAD
import React, { useState, useEffect } from "react";
import {
  Play,
  ArrowLeft,
  FileText,
  Download,
  Edit3,
  Bookmark,
  Share2,
  BarChart2,
  Clock,
  CheckCircle,
  Loader2,
} from "lucide-react";
import apiClient from "../api/client";

export function UploadHistory({
  initialVideoId,
  onOpenVideo,
  onBack,
  subTab = "detail",
}) {
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [loading, setLoading] = useState(true);
=======
import React, { useEffect, useState } from "react";
import { Film, Pause, Play, RefreshCw, Search, SlidersHorizontal, X } from "lucide-react";
import { apiClient } from "../api/client";

const formatDuration = (seconds) => {
  if (!seconds) return "Duration unavailable";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return minutes ? `${minutes}m ${remainingSeconds}s` : `${remainingSeconds}s`;
};

const formatDate = (dateString) => {
  if (!dateString) return "Date unavailable";
  return new Date(dateString).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const statusColor = (status) => ({
  processed: "var(--success)",
  processing: "var(--warning)",
  failed: "var(--danger)",
}[status] || "var(--text-muted)");

export function UploadHistory({ onOpenVideo, initialVideoId, onBack }) {
  const [videos, setVideos] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [mediaUrl, setMediaUrl] = useState("");
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    return () => {
      if (mediaUrl) URL.revokeObjectURL(mediaUrl);
    };
  }, [mediaUrl]);

  const openVideo = async (video) => {
    setSelectedVideo(video);
    setSelectedDetail(null);
    setDetailError("");
    setDetailLoading(true);
    setIsPlaying(false);
    if (mediaUrl) {
      URL.revokeObjectURL(mediaUrl);
      setMediaUrl("");
    }

    try {
      const [detailResponse, mediaResponse] = await Promise.all([
        apiClient.get(`/videos/${video.id}`),
        apiClient.get(`/videos/${video.id}/media`, { responseType: "blob" }),
      ]);
      setSelectedDetail(detailResponse.data);
      setMediaUrl(URL.createObjectURL(mediaResponse.data));
    } catch (requestError) {
      setDetailError(requestError.response?.data?.detail || "This video could not be opened.");
    } finally {
      setDetailLoading(false);
    }
  };

  const closeVideo = () => {
    setSelectedVideo(null);
    setSelectedDetail(null);
    setDetailError("");
    setIsPlaying(false);
    if (mediaUrl) {
      URL.revokeObjectURL(mediaUrl);
      setMediaUrl("");
    }
  };

  const seekVideo = (event, time) => {
    const video = event.currentTarget.closest("section")?.querySelector("video");
    if (video) {
      video.currentTime = time;
      video.play();
    }
  };

  const fetchVideos = async (isRefresh = false) => {
    setError("");
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const response = await apiClient.get("/videos/me");
      setVideos(response.data.videos || []);
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "Upload history is unavailable right now.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
>>>>>>> 6405c7b05fdff16e70d270d71c6b9e81127d6f7e

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await apiClient.get("/videos", {
          headers: { authorization: `Bearer ${token}` },
        });
        const videoData = response.data || [];
        setVideos(videoData);

        if (initialVideoId) {
          const matched = videoData.find(
            (v) => String(v.id) === String(initialVideoId),
          );
          if (matched) setSelectedVideo(matched);
        }
      } catch (err) {
        console.error("Failed to load videos", err);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, [initialVideoId]);

<<<<<<< HEAD
  const handleSelect = (video) => {
    setSelectedVideo(video);
    if (onOpenVideo) onOpenVideo(video.id);
  };

  const handleBackToList = () => {
    setSelectedVideo(null);
    if (onBack) onBack();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400 space-y-3">
        <Loader2 className="animate-spin text-emerald-500" size={24} />
        <p className="text-xs">Fetching video library...</p>
      </div>
    );
  }

  // --- VIEW 1: VIDEO DETAIL & SUB-VIEWS (MATCHING SCREENSHOTS) ---
  if (selectedVideo) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-6 md:p-8 space-y-6">
        {/* Back Button Header */}
        <button
          onClick={handleBackToList}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-emerald-600 transition"
        >
          <ArrowLeft size={14} /> Back to Video
        </button>

        {/* SUB TAB 1: VIDEO DETAIL */}
        {subTab === "detail" && (
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">
                  {selectedVideo.filename ||
                    selectedVideo.title ||
                    "Physics Lecture - 1"}
                </h1>
                <p className="text-xs text-slate-500 mt-1">Physics</p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button className="inline-flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs px-3 py-1.5 rounded-lg shadow-sm">
                  <Download size={13} /> PDF Report
                </button>
                <button className="inline-flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs px-3 py-1.5 rounded-lg shadow-sm">
                  <Download size={13} /> CSV Report
                </button>
              </div>
            </div>

            {/* Video Player & Context Panel Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 bg-black rounded-2xl overflow-hidden aspect-video relative flex items-center justify-center">
                <video
                  controls
                  src={selectedVideo.url || selectedVideo.video_url}
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="lg:col-span-4 space-y-4">
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl text-xs flex items-center gap-2">
                  <CheckCircle size={16} /> All AI processing complete
                </div>

                <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 space-y-3">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                    Key Moments
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800/60">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        Introduction to Physics Concepts
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        0:00 - 0:14 · 24%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUB TAB 2: TRANSCRIPT */}
        {subTab === "transcript" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  Transcript
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  {selectedVideo.filename}
                </p>
              </div>
              <button className="inline-flex items-center gap-1.5 bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md">
                <Edit3 size={14} /> Edit Transcript
              </button>
            </div>

            {/* Keyword Tags */}
            <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Keywords
              </span>
              <div className="flex flex-wrap gap-2">
                {["speed", "distance", "physics", "average", "time"].map(
                  (kw) => (
                    <span
                      key={kw}
                      className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg"
                    >
                      {kw}
                    </span>
                  ),
                )}
              </div>
            </div>

            {/* Transcript Text Box */}
            <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl leading-relaxed text-xs text-slate-700 dark:text-slate-300 space-y-4">
              <p>
                {selectedVideo.transcript ||
                  "What is going on guys? Welcome to your very first lesson in physics. Today we are going to talk about motion, speed, and distance over time..."}
              </p>
            </div>
          </div>
        )}

        {/* SUB TAB 3: ANALYTICS */}
        {subTab === "analytics" && (
          <div className="space-y-6">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Video Analytics
            </h1>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl">
                <p className="text-xs text-slate-500">Total Views</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  15
                </p>
              </div>
              <div className="p-4 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl">
                <p className="text-xs text-slate-500">Watch Time (min)</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  32
                </p>
              </div>
              <div className="p-4 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl">
                <p className="text-xs text-slate-500 font-medium">
                  Completion Rate
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  99%
                </p>
              </div>
              <div className="p-4 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl">
                <p className="text-xs text-slate-500">Key Moments</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  7
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SUB TAB 4: NOTES */}
        {subTab === "notes" && (
          <div className="space-y-6">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Video Notes
            </h1>
            <div className="p-6 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase">
                Summary Note
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {selectedVideo.summary ||
                  "Summary notes generated for this video will appear here."}
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- VIEW 2: MY VIDEOS GRID (DEFAULT OVERVIEW) ---
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-6 md:p-10 max-w-6xl mx-auto space-y-6">
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          My Videos
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Select a video to access transcript, key moments, and AI analytics.
        </p>
      </div>

      {videos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((vid) => (
            <div
              key={vid.id}
              onClick={() => handleSelect(vid)}
              className="group bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer"
            >
              <div className="aspect-video bg-slate-950 relative">
                <img
                  src={
                    vid.thumbnail ||
                    "https://placehold.co/600x400/0f172a/64748b?text=Uploaded+Video"
                  }
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-slate-950/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play size={20} className="text-white fill-current" />
                </div>
              </div>
              <div className="p-4">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {vid.filename}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Status: {vid.status || "Processed"}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center text-xs text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
          No uploaded videos available yet.
=======
  useEffect(() => {
    if (!initialVideoId || selectedVideo || !videos.length) return;
    const video = videos.find((item) => item.id === initialVideoId);
    if (video) openVideo(video);
  }, [initialVideoId, videos]);

  const filteredVideos = videos
    .filter((video) => {
      const query = search.trim().toLowerCase();
      const matchesSearch = !query || video.filename.toLowerCase().includes(query) || video.keywords?.toLowerCase().includes(query);
      const matchesStatus = status === "all" || video.status === status;
      return matchesSearch && matchesStatus;
    })
    .sort((first, second) => {
      if (sort === "oldest") return new Date(first.uploaded_at || 0) - new Date(second.uploaded_at || 0);
      if (sort === "name") return first.filename.localeCompare(second.filename);
      if (sort === "duration") return (second.duration_seconds || 0) - (first.duration_seconds || 0);
      return new Date(second.uploaded_at || 0) - new Date(first.uploaded_at || 0);
    });

  return (
    <section className={initialVideoId ? "library-full-page" : "dashboard-card"} style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "10px", padding: initialVideoId ? "28px" : "20px", marginTop: initialVideoId ? 0 : "18px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", flexWrap: "wrap", marginBottom: "18px" }}>
        <div>
          <p style={{ color: "var(--text)", fontSize: "15px", fontWeight: "700", margin: "0 0 4px" }}>{initialVideoId ? "Video workspace" : "Video library"}</p>
          <p style={{ color: "var(--text-muted)", fontSize: "12px", margin: 0 }}>{initialVideoId ? "Review the stored video, transcript, and key moments." : "Search and organize your processed uploads."}</p>
        </div>
        {initialVideoId ? (
          <button type="button" onClick={onBack} style={{ display: "inline-flex", alignItems: "center", gap: "7px", background: "transparent", color: "var(--text-muted)", border: "1px solid var(--border)", borderRadius: "7px", padding: "8px 11px", fontSize: "11px", fontWeight: "650", cursor: "pointer" }}><span aria-hidden="true">←</span> Back to library</button>
        ) : (
          <button type="button" onClick={() => fetchVideos(true)} disabled={refreshing} style={{ display: "inline-flex", alignItems: "center", gap: "7px", background: "transparent", color: "var(--text-muted)", border: "1px solid var(--border)", borderRadius: "7px", padding: "8px 11px", fontSize: "11px", fontWeight: "650", cursor: refreshing ? "wait" : "pointer" }}><RefreshCw size={13} className={refreshing ? "spin" : ""} /> Refresh</button>
        )}
      </div>

      {!initialVideoId && <div className="library-controls" style={{ display: "grid", gridTemplateColumns: "minmax(180px, 1fr) 150px 150px", gap: "8px", marginBottom: "16px" }}>
        <label style={{ position: "relative" }}>
          <Search size={14} color="var(--text-muted)" style={{ position: "absolute", left: "10px", top: "10px" }} />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search videos or keywords" aria-label="Search videos" style={{ width: "100%", height: "34px", padding: "0 10px 0 30px", background: "var(--bg)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: "7px", fontSize: "11px", outline: "none" }} />
        </label>
        <label style={{ position: "relative" }}>
          <SlidersHorizontal size={13} color="var(--text-muted)" style={{ position: "absolute", left: "9px", top: "10px", pointerEvents: "none" }} />
          <select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter videos by status" style={{ width: "100%", height: "34px", padding: "0 8px 0 28px", background: "var(--bg)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: "7px", fontSize: "11px" }}>
            <option value="all">All statuses</option>
            <option value="processed">Processed</option>
            <option value="processing">Processing</option>
            <option value="failed">Failed</option>
          </select>
        </label>
        <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort videos" style={{ height: "34px", padding: "0 8px", background: "var(--bg)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: "7px", fontSize: "11px" }}>
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="name">Name A-Z</option>
          <option value="duration">Longest first</option>
        </select>
      </div>}

      {loading && <p role="status" aria-live="polite" style={{ color: "var(--text-muted)", fontSize: "12px", margin: 0 }}>Loading your library…</p>}
      {error && <p role="alert" style={{ color: "var(--danger)", fontSize: "12px", margin: 0 }}>{error}</p>}
      {!initialVideoId && !loading && !error && filteredVideos.length === 0 && <div style={{ padding: "28px 16px", textAlign: "center", border: "1px dashed var(--border)", borderRadius: "8px" }}><Film size={20} color="var(--text-muted)" /><p style={{ color: "var(--text-muted)", fontSize: "12px", margin: "8px 0 0" }}>{videos.length ? "No videos match these filters." : "Your processed videos will appear here."}</p></div>}

      {!initialVideoId && !loading && !error && filteredVideos.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {filteredVideos.map((video) => (
            <button type="button" key={video.id} className="dashboard-log" onClick={() => (onOpenVideo ? onOpenVideo(video.id) : openVideo(video))} style={{ display: "flex", alignItems: "center", gap: "12px", width: "100%", textAlign: "left", color: "inherit", background: "transparent", border: "none", borderBottom: "1px solid var(--border)", padding: "12px 8px", cursor: "pointer" }}>
              <div style={{ width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)", background: "var(--accent-bg)", borderRadius: "8px", flexShrink: 0 }}><Film size={16} /></div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <p style={{ color: "var(--text)", fontSize: "12px", fontWeight: "700", margin: "0 0 4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{video.filename}</p>
                <p style={{ color: "var(--text-muted)", fontSize: "10px", margin: 0 }}>{formatDuration(video.duration_seconds)} · Uploaded {formatDate(video.uploaded_at)}</p>
              </div>
              <span style={{ color: statusColor(video.status), fontSize: "10px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>{video.status}</span>
            </button>
          ))}
>>>>>>> 6405c7b05fdff16e70d270d71c6b9e81127d6f7e
        </div>
      )}

      {selectedVideo && (
        <section style={{ marginTop: "18px", paddingTop: "18px", borderTop: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "12px" }}>
            <div style={{ minWidth: 0 }}>
              <p style={{ color: "var(--text)", fontSize: "14px", fontWeight: "700", margin: "0 0 3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selectedVideo.filename}</p>
              <p style={{ color: "var(--text-muted)", fontSize: "11px", margin: 0 }}>Stored library video · click a key moment to seek</p>
            </div>
            <button type="button" onClick={closeVideo} aria-label="Close video viewer" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "32px", height: "32px", color: "var(--text-muted)", background: "transparent", border: "1px solid var(--border)", borderRadius: "7px", cursor: "pointer" }}><X size={15} /></button>
          </div>
          {detailLoading && <p role="status" style={{ color: "var(--text-muted)", fontSize: "12px" }}>Opening video…</p>}
          {detailError && <p role="alert" style={{ color: "var(--danger)", fontSize: "12px" }}>{detailError}</p>}
          {selectedDetail && mediaUrl && (
            <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.2fr) minmax(240px, 0.8fr)", gap: "14px" }}>
              <div style={{ background: "#101418", borderRadius: "8px", overflow: "hidden" }}>
                <video src={mediaUrl} controls onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} style={{ display: "block", width: "100%", maxHeight: "360px" }} />
                <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 10px", color: "#B8BBC2", fontSize: "11px" }}>
                  {isPlaying ? <Pause size={14} /> : <Play size={14} />} Stored playback
                </div>
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ color: "var(--text)", fontSize: "12px", fontWeight: "700", margin: "0 0 7px" }}>Transcript</p>
                <div style={{ maxHeight: "180px", overflowY: "auto", padding: "10px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "7px", marginBottom: "10px" }}><p style={{ color: "var(--text)", fontSize: "11px", lineHeight: "1.55", whiteSpace: "pre-wrap", margin: 0 }}>{selectedDetail.transcript.text || "No stored transcript."}</p></div>
                <p style={{ color: "var(--text)", fontSize: "12px", fontWeight: "700", margin: "0 0 7px" }}>Key moments</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "150px", overflowY: "auto" }}>{selectedDetail.topics.map((topic) => <button type="button" key={topic.topic_id} onClick={(event) => seekVideo(event, topic.start_time)} style={{ textAlign: "left", color: "var(--text)", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "6px", padding: "7px 8px", cursor: "pointer" }}><span style={{ display: "block", color: "var(--accent)", fontSize: "10px", fontWeight: "700" }}>{formatDuration(topic.start_time)} - {formatDuration(topic.end_time)}</span><span style={{ display: "block", fontSize: "11px", marginTop: "3px" }}>{topic.text}</span></button>)}</div>
              </div>
            </div>
          )}
        </section>
      )}
    </section>
  );
}
