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
import Settings from "./components/Settings";
import Profile from "./components/Profile";
import History from "./components/History";
import Bookmarks from "./components/Bookmarks";
import { Bell, Search, Sun, Moon } from "lucide-react";
import { useTheme } from "./context/ThemeContext";

function MainApp() {
  const { user, logout } = useContext(AuthContext) || {};
  const { theme, toggleTheme } = useTheme();
  const [screen, setScreen] = useState("landing");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [libraryVideoId, setLibraryVideoId] = useState(null);
  const [selectedVideoId, setSelectedVideoId] = useState(null);
  const [videoSubTab, setVideoSubTab] = useState("detail");


  useEffect(() => {
    if (user) {
      setActiveTab("upload");
    }
  }, [user]);

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
          onNavigate={(tab, options = {}) => {
            setActiveTab(tab);
            if (tab !== "library" || options.clearVideo) {
              setSelectedVideoId(null);
            }
            if (options.clearVideo) {
              setLibraryVideoId(null);
            }
          }}
          onLogout={handleLogout}
        />

        <main className="flex-1 min-w-0 h-screen overflow-y-auto ml-52 bg-[#f7f8ff] dark:bg-slate-950">
          {activeTab === "upload" && (
            <header className="h-12 bg-white/80 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 sticky top-0 z-20">
              <div className="relative w-full max-w-xs">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input className="w-full h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 pl-9 pr-3 text-[11px] outline-none focus:border-violet-400" placeholder="Search videos, transcripts, insights..." />
              </div>
              <div className="flex items-center gap-4 text-slate-500">
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                  title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                >
                  {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
                </button>
                <button className="relative" aria-label="Notifications"><Bell size={16} /><span className="absolute -right-1 -top-1 w-1.5 h-1.5 rounded-full bg-rose-500" /></button>
                <div className="flex items-center gap-2"><div className="w-7 h-7 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">{user?.name?.[0]?.toUpperCase() || "U"}</div><div className="hidden sm:block"><p className="text-[11px] font-bold text-slate-700 dark:text-slate-200 leading-none">{user?.name || "User"}</p><p className="text-[9px] text-slate-500 dark:text-slate-400 mt-1">Content Creator</p></div></div>
              </div>
            </header>
          )}
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
          )}
          {activeTab === "library" && (
            <UploadHistory
              key={libraryVideoId ?? "library-list"}
              initialVideoId={libraryVideoId}
              onOpenVideo={setLibraryVideoId}
              onBack={() => setLibraryVideoId(null)}
            />
          )}
          {activeTab === "settings" && (
            <Settings user={user} onLogout={handleLogout} />
          )}
        </main>
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