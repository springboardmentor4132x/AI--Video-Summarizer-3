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

  useEffect(() => {
    fetchVideos();
  }, []);

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
