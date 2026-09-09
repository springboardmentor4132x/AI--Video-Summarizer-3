import React from "react";
import { useTheme } from "../context/ThemeContext";

export default function LandingPage({ onGetStarted, onSignIn }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)" }}>
      {/* Nav */}
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 40px",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              background: "var(--accent)",
              display: "inline-block",
            }}
          />
          <span style={{ fontSize: "18px", fontWeight: "700" }}>ClipMind AI</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button
            onClick={toggleTheme}
            style={{
              background: "transparent",
              border: "1px solid var(--border)",
              borderRadius: "6px",
              padding: "6px 10px",
              cursor: "pointer",
              color: "var(--text)",
              fontSize: "13px",
            }}
          >
            {theme === "light" ? "🌙 Dark" : "☀️ Light"}
          </button>
          <button
            onClick={onSignIn}
            style={{ background: "none", border: "none", color: "var(--text)", fontSize: "14px", cursor: "pointer" }}
          >
            Sign In
          </button>
          <button
            onClick={onGetStarted}
            style={{
              background: "var(--accent)",
              color: "var(--accent-text)",
              border: "none",
              borderRadius: "8px",
              padding: "10px 18px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ textAlign: "center", padding: "100px 20px 60px", maxWidth: "820px", margin: "0 auto" }}>
        <div
          style={{
            display: "inline-block",
            fontSize: "12px",
            padding: "6px 14px",
            borderRadius: "20px",
            border: "1px solid var(--border)",
            color: "var(--text-muted)",
            marginBottom: "28px",
          }}
        >
          ⭐ ClipMind AI Video Intelligence
        </div>
        <h1 style={{ fontSize: "56px", fontWeight: "800", lineHeight: "1.15", margin: "0 0 24px" }}>
          Transform Video Into
          <br />
          <span style={{ color: "var(--accent)" }}>Actionable Intelligence</span>
        </h1>
        <p style={{ fontSize: "18px", color: "var(--text-muted)", lineHeight: "1.6", margin: "0 0 36px" }}>
          Extract transcripts, instant summaries, and key moments from your videos using AI.
        </p>
        <div style={{ display: "flex", gap: "14px", justifyContent: "center" }}>
          <button
            onClick={onGetStarted}
            style={{
              background: "var(--accent)",
              color: "var(--accent-text)",
              border: "none",
              borderRadius: "8px",
              padding: "14px 26px",
              fontSize: "15px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Get Started Free →
          </button>
        </div>

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "16px",
            marginTop: "70px",
          }}
        >
          {[
            ["Fast", "Transcription", "FFmpeg + Whisper pipeline"],
            ["AI-Powered", "Summarization", "Short + detailed summaries"],
            ["Tracked", "Status Flow", "Live processing states"],
          ].map(([big, label, sub]) => (
            <div
              key={label}
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                padding: "20px",
                textAlign: "left",
              }}
            >
              <p style={{ fontSize: "22px", fontWeight: "700", color: "var(--success)", margin: "0 0 4px" }}>
                {big}
              </p>
              <p style={{ fontSize: "14px", fontWeight: "600", margin: "0 0 2px" }}>{label}</p>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: 0 }}>{sub}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}