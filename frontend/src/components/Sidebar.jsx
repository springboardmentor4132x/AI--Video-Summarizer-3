import React from "react";
import {
  LayoutDashboard,
  User,
  Upload,
  Video,
  History,
  Bookmark,
  Settings,
  Brain,
  VideoIcon,
  FileText,
  Sparkles,
  Zap,
  BarChart2,
  FileCheck,
} from "lucide-react";

const MAIN_NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "profile", label: "Profile", icon: User },
  { key: "upload", label: "Upload Video", icon: Upload },
  { key: "library", label: "My Videos", icon: Video },
  { key: "history", label: "History", icon: History },
  { key: "bookmarks", label: "Bookmarks", icon: Bookmark, badge: true },
];

const VIDEO_SUB_ITEMS = [
  { key: "detail", label: "Video Detail", icon: VideoIcon },
  { key: "transcript", label: "Transcript", icon: FileText },
  { key: "summary", label: "Summary", icon: Sparkles },
  { key: "key-moments", label: "Key Moments", icon: Zap },
  { key: "analytics", label: "Analytics", icon: BarChart2 },
  { key: "notes", label: "Notes", icon: FileCheck },
];

export default function Sidebar({
  user,
  active,
  onNavigate,
  bookmarkCount = 0,
  selectedVideoId,
  videoSubTab,
  onSelectSubTab,
}) {
  return (
    <aside className="fixed top-0 left-0 h-screen w-60 bg-slate-100 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 flex flex-col justify-between z-40 overflow-y-auto transition-colors duration-200">
      <div className="py-6">
        {/* Brand Header */}
        <div className="flex items-center gap-2.5 px-5 pb-5">
          <div className="w-8 h-8 rounded-full bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center shrink-0 shadow-md">
            <Brain size={18} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
              ClipMind AI
            </p>
            <p className="text-[9px] font-semibold text-slate-500 dark:text-slate-400 tracking-widest uppercase">
              Intelligence Hub
            </p>
          </div>
        </div>

        {/* User Card */}
        <div className="mx-4 mb-5 flex items-center gap-2.5 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-xl p-2.5 shadow-sm dark:shadow-none">
          <div className="w-7 h-7 rounded-full bg-indigo-600 dark:bg-indigo-500 text-white font-bold flex items-center justify-center text-xs shrink-0">
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
              {user?.name || "User"}
            </p>
            <span className="text-[9px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded-full">
              Content Creator
            </span>
          </div>
        </div>

        {/* Contextual "CURRENT VIDEO" Sub-Navigation */}
        {selectedVideoId && (
          <div className="px-3 mb-5">
            <p className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-3 mb-1.5">
              Current Video
            </p>
            <div className="space-y-0.5 bg-slate-200/60 dark:bg-slate-800/60 rounded-xl p-1 border border-slate-300/60 dark:border-slate-700/60">
              {VIDEO_SUB_ITEMS.map((item) => {
                const Icon = item.icon;
                const isSubActive =
                  active === "library" && videoSubTab === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => {
                      onNavigate("library");
                      onSelectSubTab(item.key);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isSubActive
                        ? "bg-indigo-600 text-white font-bold shadow-md"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-300/50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <Icon size={14} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Main Navigation Items */}
        <nav className="px-3 space-y-1">
          {MAIN_NAV_ITEMS.map((item) => {
            const isActive = active === item.key && !selectedVideoId;
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                onClick={() => onNavigate(item.key)}
                className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-indigo-600 text-white font-bold shadow-sm"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Icon size={15} />
                  {item.label}
                </span>
                {item.badge && bookmarkCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[9px] font-bold flex items-center justify-center">
                    {bookmarkCount}
                  </span>
                )}
              </button>
            );
          })}

          <button
            onClick={() => onNavigate("settings")}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
              active === "settings"
                ? "bg-indigo-600 text-white font-bold shadow-sm"
                : "text-slate-700 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Settings size={15} />
            Settings
          </button>
        </nav>
      </div>
    </aside>
  );
}
