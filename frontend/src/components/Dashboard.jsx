import React from "react";

export default function Dashboard({ user, onUploadClick }) {
  const stats = [
    { label: "Videos Uploaded", value: "0", icon: "🎬" },
    { label: "Transcripts Generated", value: "0", icon: "📝" },
    { label: "Summaries Created", value: "0", icon: "✨" },
  ];

  return (
    <div style={{ padding: "40px", maxWidth: "900px" }}>
      <h1 style={{ fontSize: "26px", fontWeight: "700", color: "var(--text)", margin: "0 0 4px" }}>
        Welcome back, {user?.name || "there"} 👋
      </h1>
      <p style={{ fontSize: "14px", color: "var(--text-muted)", margin: "0 0 32px" }}>
        Here's what's happening with your videos.
      </p>

      {/* Stat cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
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
            <div style={{ fontSize: "22px", marginBottom: "10px" }}>{s.icon}</div>
            <p style={{ fontSize: "24px", fontWeight: "700", color: "var(--text)", margin: "0 0 2px" }}>
              {s.value}
            </p>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: 0 }}>{s.label}</p>
          </div>
        ))}
      </div>

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
    </div>
  );
}