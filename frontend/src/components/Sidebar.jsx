import React from "react";
import { useTheme } from "../context/ThemeContext";

const NAV_ITEMS = [
  { key: "home", label: "Home", icon: "🏠" },
  { key: "dashboard", label: "Dashboard", icon: "📊" },
  { key: "upload", label: "Upload Video", icon: "⬆️" },
];

export default function Sidebar({ user, active, onNavigate, onLogout }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div
      className="app-sidebar"
      style={{
        width: "230px",
        flexShrink: 0,
        minHeight: "100vh",
        background: "var(--bg-sidebar)",
        color: "#F4F3EF",
        padding: "24px 16px",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
        position: "sticky",
        top: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px", padding: "0 8px" }}>
        <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--accent)", flexShrink: 0 }} />
        <span className="sidebar-brand-text" style={{ fontSize: "15px", fontWeight: "700" }}>ClipMind AI</span>
      </div>
      <p className="sidebar-label" style={{ fontSize: "10px", color: "#9A9DA5", padding: "0 8px", margin: "0 0 28px" }}>
        INTELLIGENCE HUB
      </p>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          background: "rgba(255,255,255,0.05)",
          borderRadius: "10px",
          padding: "10px 12px",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            width: "34px",
            height: "34px",
            borderRadius: "50%",
            background: "var(--accent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "700",
            color: "var(--accent-text)",
            fontSize: "14px",
            flexShrink: 0,
          }}
        >
          {user?.name?.[0]?.toUpperCase() || "U"}
        </div>
        <div className="sidebar-usercard-text">
          <p style={{ margin: 0, fontSize: "13px", fontWeight: "600" }}>{user?.name || "User"}</p>
          <p style={{ margin: 0, fontSize: "10px", color: "var(--accent)", fontWeight: "600" }}>
            {user?.role?.toUpperCase() || "LEARNER"}
          </p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.key}
            onClick={() => onNavigate(item.key)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              background: active === item.key ? "rgba(240,162,2,0.15)" : "transparent",
              color: active === item.key ? "var(--accent)" : "#D0D2D8",
              border: "none",
              borderRadius: "8px",
              padding: "10px 12px",
              fontSize: "13px",
              fontWeight: "500",
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <span>{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </button>
        ))}
      </div>

      <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "6px" }}>
        <button
          onClick={toggleTheme}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            background: "transparent",
            color: "#D0D2D8",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "8px",
            padding: "10px 12px",
            fontSize: "13px",
            cursor: "pointer",
          }}
        >
          <span>{theme === "light" ? "🌙" : "☀️"}</span>
          <span className="sidebar-label">{theme === "light" ? "Dark mode" : "Light mode"}</span>
        </button>
        <button
          onClick={onLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            background: "transparent",
            color: "#D0D2D8",
            border: "none",
            borderRadius: "8px",
            padding: "10px 12px",
            fontSize: "13px",
            cursor: "pointer",
          }}
        >
          <span>🚪</span>
          <span className="sidebar-label">Sign Out</span>
        </button>
      </div>
    </div>
  );
}