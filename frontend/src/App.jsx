import React, { useState, useContext } from "react";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import AuthLayout from "./components/AuthLayout";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import VideoUploader from "./components/VideoUploader";

function MainApp() {
  const { user, logout } = useContext(AuthContext) || {};
  const [view, setView] = useState("login");

  if (!user) {
    return (
      <AuthLayout>
        {view === "login" ? (
          <LoginForm onSwitchToRegister={() => setView("register")} />
        ) : (
          <RegisterForm onSwitchToLogin={() => setView("login")} />
        )}
      </AuthLayout>
    );
  }

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "2rem auto",
        padding: "0 1rem",
        color: "#fff",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <h2>ClipMind AI Platform</h2>
        <button
          onClick={logout}
          style={{ padding: "0.5rem 1rem", cursor: "pointer" }}
        >
          Logout
        </button>
      </div>
      <VideoUploader />
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
