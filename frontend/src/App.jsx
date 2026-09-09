import React, { useState, useContext } from "react";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import AuthLayout from "./components/AuthLayout";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import VideoUploader from "./components/VideoUploader";
import LandingPage from "./components/LandingPage";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";

function MainApp() {
  const { user, logout } = useContext(AuthContext) || {};
  const [screen, setScreen] = useState("landing");
  const [activeTab, setActiveTab] = useState("upload");

  if (user) {
    if (activeTab === "home") {
      return (
        <div style={{ display: "flex", width: "100%", minHeight: "100vh", background: "var(--bg)" }}>
          <Sidebar user={user} active={activeTab} onNavigate={setActiveTab} onLogout={() => { logout(); setScreen("landing"); }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <LandingPage onGetStarted={() => setActiveTab("upload")} onSignIn={() => setActiveTab("upload")} />
          </div>
        </div>
      );
    }
    return (
      <div style={{ display: "flex", width: "100%", minHeight: "100vh", background: "var(--bg)" }}>
        <Sidebar
          user={user}
          active={activeTab}
          onNavigate={setActiveTab}
          onLogout={() => {
            logout();
            setScreen("landing");
          }}
        />
        <div style={{ flex: 1, minWidth: 0, overflow: "auto" }}>
          {activeTab === "upload" && <VideoUploader />}
          {activeTab === "dashboard" && (
            <Dashboard user={user} onUploadClick={() => setActiveTab("upload")} />
          )}
        </div>
      </div>
    );
  }

  if (screen === "landing") {
    return (
      <LandingPage
        onGetStarted={() => setScreen("register")}
        onSignIn={() => setScreen("login")}
      />
    );
  }

  return (
    <AuthLayout>
      {screen === "login" ? (
        <LoginForm onSwitchToRegister={() => setScreen("register")} />
      ) : (
        <RegisterForm onSwitchToLogin={() => setScreen("login")} />
      )}
    </AuthLayout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}