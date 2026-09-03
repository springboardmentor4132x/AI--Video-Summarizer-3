import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function LoginForm({ onSwitchToRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext) || {};

  const handleSubmit = (e) => {
    e.preventDefault();
    if (login) {
      login({ email });
    } else {
      alert("Logged in!");
    }
  };

  return (
    <div style={{ maxWidth: "280px", width: "100%", margin: "0 auto" }}>
      <p
        style={{
          fontSize: "18px",
          fontWeight: "500",
          color: "#1F2328",
          margin: "0 0 4px",
        }}
      >
        Log in
      </p>
      <p style={{ fontSize: "13px", color: "#6B6F76", margin: "0 0 22px" }}>
        Welcome back to your workspace.
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "12px" }}>
          <p style={{ fontSize: "12px", color: "#6B6F76", margin: "0 0 5px" }}>
            Email
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "#FFFFFF",
              border: "0.5px solid #E4E2DC",
              borderRadius: "6px",
              padding: "9px 12px",
            }}
          >
            <span style={{ fontSize: "13px", color: "#9A9DA5" }}>✉</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{
                border: "none",
                outline: "none",
                width: "100%",
                fontSize: "13px",
                color: "#1F2328",
                background: "transparent",
              }}
            />
          </div>
        </div>

        <div style={{ marginBottom: "18px" }}>
          <p style={{ fontSize: "12px", color: "#6B6F76", margin: "0 0 5px" }}>
            Password
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "#FFFFFF",
              border: "0.5px solid #E4E2DC",
              borderRadius: "6px",
              padding: "9px 12px",
            }}
          >
            <span style={{ fontSize: "13px", color: "#9A9DA5" }}>🔒</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                border: "none",
                outline: "none",
                width: "100%",
                fontSize: "13px",
                color: "#1F2328",
                background: "transparent",
              }}
            />
          </div>
        </div>

        <button
          type="submit"
          style={{
            width: "100%",
            background: "#F0A202",
            color: "#412402",
            textAlign: "center",
            fontSize: "13px",
            fontWeight: "500",
            padding: "10px",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
          }}
        >
          Log in
        </button>
      </form>

      <p
        style={{
          fontSize: "12px",
          color: "#6B6F76",
          textAlign: "center",
          margin: "16px 0 0",
        }}
      >
        No account?{" "}
        <span
          onClick={onSwitchToRegister}
          style={{ color: "#1F2328", fontWeight: "500", cursor: "pointer" }}
        >
          Register
        </span>
      </p>
    </div>
  );
}
