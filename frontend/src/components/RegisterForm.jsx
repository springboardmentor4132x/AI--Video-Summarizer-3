import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function RegisterForm({ onSwitchToLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accountType, setAccountType] = useState("Learner");
  const { login } = useContext(AuthContext) || {};

  const handleSubmit = (e) => {
    e.preventDefault();
    if (login) {
      login({ email, accountType });
    } else {
      alert(`Account created as ${accountType}!`);
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
        Register
      </p>
      <p style={{ fontSize: "13px", color: "#6B6F76", margin: "0 0 22px" }}>
        Start summarizing videos in seconds.
      </p>

      <form onSubmit={handleSubmit}>
        {/* Account Type Selection */}
        <div style={{ marginBottom: "12px" }}>
          <p style={{ fontSize: "12px", color: "#6B6F76", margin: "0 0 5px" }}>
            Account Type
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
            <span style={{ fontSize: "13px", color: "#9A9DA5" }}>👤</span>
            <select
              value={accountType}
              onChange={(e) => setAccountType(e.target.value)}
              style={{
                border: "none",
                outline: "none",
                width: "100%",
                fontSize: "13px",
                color: "#1F2328",
                background: "transparent",
                cursor: "pointer",
              }}
            >
              <option value="Learner">Learner</option>
              <option value="Content Creator">Content Creator</option>
              <option value="Educator">Educator</option>
              <option value="Administrator">Administrator</option>
            </select>
          </div>
        </div>

        {/* Email Field */}
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

        {/* Password Field */}
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
          Create Account
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
        Have an account?{" "}
        <span
          onClick={onSwitchToLogin}
          style={{ color: "#1F2328", fontWeight: "500", cursor: "pointer" }}
        >
          Log in
        </span>
      </p>
    </div>
  );
}
