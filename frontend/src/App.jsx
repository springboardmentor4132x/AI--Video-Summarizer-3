import React, { useState, useEffect, useContext } from "react";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import AuthLayout from "./components/AuthLayout";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import VideoUploader from "./components/VideoUploader";
import LandingPage from "./components/LandingPage";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import { UploadHistory } from "./components/UploadHistory";
<<<<<<< HEAD
import Settings from "./components/Settings";
import Profile from "./components/Profile";
import History from "./components/History";
import Bookmarks from "./components/Bookmarks";
=======
>>>>>>> 6405c7b05fdff16e70d270d71c6b9e81127d6f7e

function MainApp() {
  const { user, logout } = useContext(AuthContext) || {};
  const [screen, setScreen] = useState("landing");
<<<<<<< HEAD
  const [activeTab, setActiveTab] = useState("dashboard");
  const [libraryVideoId, setLibraryVideoId] = useState(null);
  const [selectedVideoId, setSelectedVideoId] = useState(null);
  const [videoSubTab, setVideoSubTab] = useState("detail");


  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const handleLogout = () => {
    if (logout) logout();
    setScreen("landing");
  };

  if (user) {
    return (
      <div className="flex w-full min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
        <Sidebar
          user={user}
          active={activeTab}
          selectedVideoId={selectedVideoId}
          videoSubTab={videoSubTab}
          onSelectSubTab={setVideoSubTab}
          onNavigate={(tab) => {
            setActiveTab(tab);
            if (tab !== "library") setSelectedVideoId(null);
          }}
          onLogout={handleLogout}
        />

        <main className="flex-1 min-w-0 h-screen overflow-y-auto ml-60">
          {activeTab === "home" && (
            <LandingPage
              onGetStarted={() => setActiveTab("upload")}
              onSignIn={() => setActiveTab("upload")}
            />
          )}

          {activeTab === "history" && (
            <History
              onSelectVideo={(id) => {
                setLibraryVideoId(id);
                setActiveTab("library");
              }}
            />
          )}
          {activeTab === "bookmarks" && (
            <Bookmarks
              onSelectVideo={(id) => {
                setLibraryVideoId(id);
                setActiveTab("library");
              }}
            />
          )}
          {activeTab === "upload" && <VideoUploader />}

          {activeTab === "upload" && (
            <VideoUploader
              onVideoUploaded={(id) => {
                setSelectedVideoId(id);
              }}
            />
          )}
          {activeTab === "profile" && <Profile user={user} />}
          {activeTab === "dashboard" && (
            <Dashboard
              user={user}
              onUploadClick={() => setActiveTab("upload")}
            />
=======
  const [activeTab, setActiveTab] = useState("upload");
  const [libraryVideoId, setLibraryVideoId] = useState(null);

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
>>>>>>> 6405c7b05fdff16e70d270d71c6b9e81127d6f7e
          )}
          {activeTab === "library" && (
            <UploadHistory
              key={libraryVideoId ?? "library-list"}
              initialVideoId={libraryVideoId}
              onOpenVideo={setLibraryVideoId}
              onBack={() => setLibraryVideoId(null)}
            />
          )}
<<<<<<< HEAD
          {activeTab === "settings" && (
            <Settings user={user} onLogout={handleLogout} />
          )}
        </main>
=======
        </div>
>>>>>>> 6405c7b05fdff16e70d270d71c6b9e81127d6f7e
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