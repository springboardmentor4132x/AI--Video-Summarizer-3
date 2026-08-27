import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export function LoginForm({ onSwitchToRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError("");
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid email or password");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.card}>
      <h2>Log In</h2>
      {error && <p style={styles.error}>{error}</p>}

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        style={styles.input}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        style={styles.input}
      />

      <button type="submit" style={styles.button}>
        Log In
      </button>
      <p style={{ marginTop: "1rem", fontSize: "0.9rem" }}>
        Don't have an account?{" "}
        <span onClick={onSwitchToRegister} style={styles.link}>
          Register
        </span>
      </p>
    </form>
  );
}

const styles = {
  card: {
    maxWidth: "400px",
    margin: "2rem auto",
    padding: "1.5rem",
    border: "1px solid #ddd",
    borderRadius: "8px",
    textAlign: "left",
  },
  input: {
    display: "block",
    width: "100%",
    marginBottom: "1rem",
    padding: "0.5rem",
    borderRadius: "4px",
    border: "1px solid #ccc",
    boxSizing: "border-box",
  },
  button: {
    width: "100%",
    padding: "0.6rem",
    backgroundColor: "#4f46e5",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  error: { color: "red", fontSize: "0.85rem", marginBottom: "1rem" },
  link: { color: "#4f46e5", cursor: "pointer", textDecoration: "underline" },
};
