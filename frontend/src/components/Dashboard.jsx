import React, { useState, useEffect } from "react";
import { apiClient } from "../api/client";

export default function Dashboard({ user, onUploadClick }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await apiClient.get("/analytics", {
          headers: { authorization: `Bearer ${token}` },
        });
        setAnalytics(res.data);
      } catch (err) {
        setError("Couldn't load analytics right now.");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const formatDuration = (totalSeconds) => {
    if (!totalSeconds) return "0m";
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const statusColor = (status) => {
    const map = {
      processed: "var(--success)",
      processing: "var(--warning)",
      failed: "var(--danger)",
    };
    return map[status] || "var(--text-muted)";
  };

  const stats = analytics
    ? [
        { label: "Videos Uploaded", value: analytics.videos_uploaded, icon: "🎬" },
        { label: "Transcripts Generated", value: analytics.transcripts_completed, icon: "📝" },
        { label: "Summaries Created", value: analytics.summaries_completed, icon: "✨" },
        { label: "Topics Detected", value: analytics.total_topics_detected, icon: "🧩" },
        { label: "Total Watch Time", value: formatDuration(analytics.total_duration_seconds), icon: "⏱️" },
      ]
    : [];

  const cardBoxStyle = {
    background: "var(--bg-elevated)",
    border: "1px solid var(--border)",
    borderRadius: "12px",
    padding: "20px 24px",
    marginBottom: "24px",
  };

  return (
    <div style={{ padding: "40px", maxWidth: "900px" }}>
      <h1 style={{ fontSize: "26px", fontWeight: "700", color: "var(--text)", margin: "0 0 4px" }}>
        Welcome back, {user?.name || "there"} 👋
      </h1>
      <p style={{ fontSize: "14px", color: "var(--text-muted)", margin: "0 0 32px" }}>
        Here's what's happening with your videos.
      </p>

      {loading && (
        <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>Loading analytics…</p>
      )}

      {error && (
        <p style={{ fontSize: "13px", color: "var(--danger)" }}>{error}</p>
      )}

      {analytics && (
        <>
          {/* Stat cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: "16px",
              marginBottom: "32px",
            }}
          >
            {stats.map((s) => (
              <div
                key={s.label}
                style={{
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border)",
                  borderRadius: "12px",
                  padding: "20px",
                }}
              >
                <div style={{ fontSize: "20px", marginBottom: "10px" }}>{s.icon}</div>
                <p style={{ fontSize: "22px", fontWeight: "700", color: "var(--text)", margin: "0 0 2px" }}>
                  {s.value}
                </p>
                <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: 0 }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Content Insights */}
          {analytics.top_keywords && analytics.top_keywords.length > 0 && (
            <div style={cardBoxStyle}>
              <p style={{ fontSize: "15px", fontWeight: "700", color: "var(--text)", margin: "0 0 4px" }}>
                Content Insights
              </p>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "0 0 14px" }}>
                Your most discussed topics across all videos
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {analytics.top_keywords.map((k) => (
                  <span
                    key={k.keyword}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "var(--accent-text)",
                      background: "var(--accent)",
                      padding: "5px 12px",
                      borderRadius: "14px",
                    }}
                  >
                    {k.keyword}
                    <span style={{ fontSize: "10px", opacity: 0.8 }}>×{k.count}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Most Important Topics */}
          {analytics.top_topics && analytics.top_topics.length > 0 && (
            <div style={cardBoxStyle}>
              <p style={{ fontSize: "15px", fontWeight: "700", color: "var(--text)", margin: "0 0 4px" }}>
                Most Important Topics
              </p>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "0 0 14px" }}>
                Longest-discussed segments across your videos
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {analytics.top_topics.map((t, i) => (
                  <div
                    key={`${t.video_id}-${t.topic_id}-${i}`}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: "12px",
                      padding: "10px 0",
                      borderBottom: i < analytics.top_topics.length - 1 ? "1px solid var(--border)" : "none",
                    }}
                  >
                    <p style={{ fontSize: "13px", color: "var(--text)", margin: 0, flex: 1 }}>
                      {t.text}
                    </p>
                    <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--accent)", whiteSpace: "nowrap" }}>
                      {formatTime(t.start_time)}–{formatTime(t.end_time)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent videos */}
          {analytics.recent_videos && analytics.recent_videos.length > 0 && (
            <div style={cardBoxStyle}>
              <p style={{ fontSize: "15px", fontWeight: "700", color: "var(--text)", margin: "0 0 14px" }}>
                Recent Videos
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {analytics.recent_videos.map((v) => (
                  <div
                    key={v.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 0",
                      borderBottom: "1px solid var(--border)",
                    }}
                  >
                    <div>
                      <p style={{ fontSize: "13px", fontWeight: "600", color: "var(--text)", margin: "0 0 2px" }}>
                        {v.filename}
                      </p>
                      <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: 0 }}>
                        {v.duration_seconds ? formatDuration(v.duration_seconds) : "—"}
                        {v.uploaded_at && ` · ${new Date(v.uploaded_at).toLocaleDateString()}`}
                      </p>
                    </div>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: "700",
                        color: statusColor(v.status),
                        textTransform: "capitalize",
                      }}
                    >
                      {v.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
              borderRadius: "12px",
              padding: "28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "16px",
            }}
          >
            <div>
              <p style={{ fontSize: "16px", fontWeight: "700", color: "var(--text)", margin: "0 0 4px" }}>
                Ready to summarize a video?
              </p>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: 0 }}>
                Upload an MP4 to get a transcript and AI summary in seconds.
              </p>
            </div>
            <button
              onClick={onUploadClick}
              style={{
                background: "var(--accent)",
                color: "var(--accent-text)",
                border: "none",
                borderRadius: "8px",
                padding: "12px 22px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              Upload Video →
            </button>
          </div>
        </>
      )}
    </div>
  );
}