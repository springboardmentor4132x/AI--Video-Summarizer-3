import React, { useState } from "react";
import { registerUser } from "../api/authApi";

export function RegisterForm({ onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "Content Creator",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setError("");
      await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });
      alert("Registration successful! Please log in.");
      onSwitchToLogin();
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.card}>
      <h2>Register Account</h2>
      {error && <p style={styles.error}>{error}</p>}

      <input
        name="name"
        placeholder="Full Name"
        onChange={handleChange}
        required
        style={styles.input}
      />
      <input
        name="email"
        type="email"
        placeholder="Email"
        onChange={handleChange}
        required
        style={styles.input}
      />
      <input
        name="password"
        type="password"
        placeholder="Password"
        onChange={handleChange}
        required
        style={styles.input}
      />
      <input
        name="confirmPassword"
        type="password"
        placeholder="Confirm Password"
        onChange={handleChange}
        required
        style={styles.input}
      />

      <label style={styles.label}>Select Role:</label>
      <select
        name="role"
        value={formData.role}
        onChange={handleChange}
        style={styles.input}
      >
        <option value="Content Creator">Content Creator</option>
        <option value="Learner">Learner</option>
        <option value="Educator">Educator</option>
        <option value="Administrator">Administrator</option>
      </select>

      <button type="submit" style={styles.button}>
        Register
      </button>
      <p style={{ marginTop: "1rem", fontSize: "0.9rem" }}>
        Already have an account?{" "}
        <span onClick={onSwitchToLogin} style={styles.link}>
          Login
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
  label: {
    fontSize: "0.85rem",
    fontWeight: "bold",
    marginBottom: "0.2rem",
    display: "block",
  },
  button: {
    width: "100%",
    padding: "0.6rem",
    backgroundColor: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  error: { color: "red", fontSize: "0.85rem", marginBottom: "1rem" },
  link: { color: "#2563eb", cursor: "pointer", textDecoration: "underline" },
};
