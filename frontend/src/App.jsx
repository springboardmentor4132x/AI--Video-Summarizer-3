import React, { useState, useContext } from "react";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { RegisterForm } from "./components/RegisterForm";
import { LoginForm } from "./components/LoginForm";
import { VideoUploader } from "./components/VideoUploader";
import { UploadHistory } from "./components/UploadHistory";

function MainApp() {
  const { user, logout } = useContext(AuthContext);
  const [authView, setAuthView] = useState("login"); // 'login' or 'register'
  const [appView, setAppView] = useState("upload"); // 'upload' or 'history'

  if (!user) {
    return (
      <div style={{ textAlign: "center", paddingTop: "2rem" }}>
        <h1>ClipMind AI Platform</h1>
        {authView === "login" ? (
          <LoginForm onSwitchToRegister={() => setAuthView("register")} />
        ) : (
          <RegisterForm onSwitchToLogin={() => setAuthView("login")} />
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
        <>
          {/* Tab Navigation */}
          <div style={styles.tabContainer}>
            <button
              onClick={() => setAppView("upload")}
              style={{
                ...styles.tabButton,
                ...(appView === "upload" ? styles.tabButtonActive : styles.tabButtonInactive),
              }}
            >
              Upload Video
            </button>
            <button
              onClick={() => setAppView("history")}
              style={{
                ...styles.tabButton,
                ...(appView === "history" ? styles.tabButtonActive : styles.tabButtonInactive),
              }}
            >
              Upload History
            </button>
          </div>

          {/* Content based on active tab */}
          {appView === "upload" ? <VideoUploader /> : <UploadHistory />}
        </>
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

const styles = {
  tabContainer: {
    display: "flex",
    gap: "0.5rem",
    marginBottom: "1.5rem",
    borderBottom: "2px solid #d1d5db",
  },
  tabButton: {
    padding: "0.75rem 1.5rem",
    border: "none",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "500",
    transition: "all 0.2s",
  },
  tabButtonActive: {
    backgroundColor: "transparent",
    color: "#059669",
    borderBottom: "3px solid #059669",
    marginBottom: "-2px",
  },
  tabButtonInactive: {
    backgroundColor: "transparent",
    color: "#6b7280",
  },
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
