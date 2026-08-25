import React, { useState, useContext } from "react";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { RegisterForm } from "./components/RegisterForm";
import { LoginForm } from "./components/LoginForm";
import { VideoUploader } from "./components/VideoUploader";

function MainApp() {
  const { user, logout } = useContext(AuthContext);
  const [view, setView] = useState("login"); // 'login' or 'register'

  if (!user) {
    return (
      <div style={{ textAlign: "center", paddingTop: "2rem" }}>
        <h1>ClipMind AI Platform</h1>
        {view === "login" ? (
          <LoginForm onSwitchToRegister={() => setView("register")} />
        ) : (
          <RegisterForm onSwitchToLogin={() => setView("login")} />
        )}
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h2>Welcome, {user.email}</h2>
          <p>
            Role: <strong>{user.role}</strong>
          </p>
        </div>
        <button
          onClick={logout}
          style={{ padding: "0.5rem 1rem", cursor: "pointer" }}
        >
          Logout
        </button>
      </header>

      <hr style={{ margin: "1.5rem 0" }} />

      {/* Role-based view logic */}
      {["Content Creator", "Educator", "Administrator"].includes(user.role) ? (
        <VideoUploader />
      ) : (
        <div
          style={{
            padding: "1rem",
            backgroundColor: "#fef3c7",
            borderRadius: "6px",
          }}
        >
          Learner mode: You have view-only access to summaries and transcripts.
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
