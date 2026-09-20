import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Trash2,
  Bell,
  Sun,
  Moon,
  HelpCircle,
  MessageSquare,
  LifeBuoy,
  Info,
  Shield,
  FileText,
  LogOut,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

export default function Settings({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState("account");

 
  const [notifications, setNotifications] = useState({
    processingComplete: true,
    transcriptReady: true,
    weeklySummary: false,
  });

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "dark";
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const handleToggleNotification = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
    triggerSavedFeedback();
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    triggerSavedFeedback();
  };

  const triggerSavedFeedback = () => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const menuItems = [
    { id: "account", label: "Account", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    {
      id: "appearance",
      label: "Appearance",
      icon: theme === "dark" ? Moon : Sun,
    },
    { id: "support", label: "Help & Support", icon: HelpCircle },
    { id: "about", label: "About", icon: Info },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-6 md:p-10 max-w-6xl mx-auto space-y-6 transition-colors duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Settings
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage your account preferences, notifications, and application
            settings.
          </p>
        </div>
        {savedNotice && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 px-3 py-1.5 rounded-xl transition-all">
            <CheckCircle size={14} /> Preferences updated
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-4 lg:col-span-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-900/60"
                }`}
              >
                <Icon size={16} />
                {item.label}
              </button>
            );
          })}

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80 mt-4">
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-transparent hover:border-rose-200 dark:hover:border-rose-900/40 transition-all"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>

        <div className="md:col-span-8 lg:col-span-9 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 backdrop-blur-md min-h-[420px] shadow-sm dark:shadow-none">
          {activeTab === "account" && (
            <div className="space-y-6">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide border-b border-slate-200 dark:border-slate-800/80 pb-3">
                Account Details
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">
                    Profile Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      readOnly
                      value={user?.name || "Pragati Shaw"}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                    />
                    <User
                      size={14}
                      className="absolute left-3 top-2.5 text-slate-400 dark:text-slate-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      readOnly
                      value={user?.email || "pragati@example.com"}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                    />
                    <Mail
                      size={14}
                      className="absolute left-3 top-2.5 text-slate-400 dark:text-slate-500"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200 dark:border-slate-800/80">
                <h3 className="text-xs font-bold text-rose-600 dark:text-rose-400 mb-1">
                  Danger Zone
                </h3>
                <p className="text-[11px] text-slate-500 mb-3">
                  Permanently delete your ClipMind account and remove all
                  uploaded media.
                </p>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="inline-flex items-center gap-2 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60 text-xs font-bold px-4 py-2 rounded-xl transition-all"
                >
                  <Trash2 size={14} /> Delete Account
                </button>
              </div>
            </div>
          )}

          {/* 2) NOTIFICATIONS */}
          {activeTab === "notifications" && (
            <div className="space-y-6">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide border-b border-slate-200 dark:border-slate-800/80 pb-3">
                Notification Preferences
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/60 rounded-xl">
                  <div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Video Processing Complete
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Get notified when video ingestion and analysis finishes.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.processingComplete}
                    onChange={() =>
                      handleToggleNotification("processingComplete")
                    }
                    className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/60 rounded-xl">
                  <div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Transcript & Summary Ready
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Receive alerts when AI generates word timestamps and
                      summaries.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.transcriptReady}
                    onChange={() => handleToggleNotification("transcriptReady")}
                    className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 3) THEME */}
          {activeTab === "appearance" && (
            <div className="space-y-6">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide border-b border-slate-200 dark:border-slate-800/80 pb-3">
                Theme Customization
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleThemeChange("dark")}
                  className={`p-4 rounded-xl border flex flex-col items-center gap-3 transition-all ${
                    theme === "dark"
                      ? "bg-indigo-600/10 border-indigo-500 text-indigo-500 dark:text-indigo-400"
                      : "bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <Moon size={24} />
                  <span className="text-xs font-semibold">Dark Mode</span>
                </button>

                <button
                  onClick={() => handleThemeChange("light")}
                  className={`p-4 rounded-xl border flex flex-col items-center gap-3 transition-all ${
                    theme === "light"
                      ? "bg-indigo-600/10 border-indigo-500 text-indigo-500 dark:text-indigo-400"
                      : "bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <Sun size={24} />
                  <span className="text-xs font-semibold">Light Mode</span>
                </button>
              </div>
            </div>
          )}

          {/* 4) HELP & SUPPORT */}
          {activeTab === "support" && (
            <div className="space-y-6">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide border-b border-slate-200 dark:border-slate-800/80 pb-3">
                Help & Support
              </h2>

              <div className="space-y-3">
                <a
                  href="mailto:support@clipmind.ai?subject=Report%20an%20Issue"
                  className="flex items-center gap-3 p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700/80 rounded-xl transition-all group"
                >
                  <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                    <MessageSquare size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      Report a Problem
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Submit bugs or transcript errors directly to engineering.
                    </p>
                  </div>
                </a>

                <a
                  href="mailto:support@clipmind.ai?subject=Support%20Inquiry"
                  className="flex items-center gap-3 p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700/80 rounded-xl transition-all group"
                >
                  <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                    <LifeBuoy size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      Contact Support
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Get help with your video limits or pipeline integration.
                    </p>
                  </div>
                </a>
              </div>
            </div>
          )}

          {/* 5) ABOUT */}
          {activeTab === "about" && (
            <div className="space-y-6">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide border-b border-slate-200 dark:border-slate-800/80 pb-3">
                About ClipMind AI
              </h2>

              <div className="space-y-4 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/60 rounded-xl space-y-2">
                  <p className="text-slate-800 dark:text-slate-200 font-semibold">
                    ClipMind AI Video Intelligence Suite
                  </p>
                  <p className="text-[11px]">
                    ClipMind transforms raw video footage into structured
                    insights, complete with Whisper AI transcripts, keyword
                    detection, and instant chat query responses.
                  </p>
                  <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono">
                    Version v1.2.0-stable
                  </p>
                </div>

                <div className="flex gap-4">
                  <button className="inline-flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200">
                    <FileText size={14} /> Terms of Service
                  </button>
                  <button className="inline-flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200">
                    <Shield size={14} /> Privacy Policy
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <AlertTriangle size={20} />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Delete Account?
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Are you sure? This action is permanent and will immediately delete
              all your processed videos and transcripts.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  onLogout();
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
