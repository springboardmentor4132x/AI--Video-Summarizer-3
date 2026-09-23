import React from "react";
import {
  LayoutDashboard,
  User,
  Upload,
  Video,
  Settings,
  Brain,
} from "lucide-react";

const MAIN_NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "profile", label: "Profile", icon: User },
  { key: "upload", label: "Upload Video", icon: Upload },
  { key: "library", label: "My Videos", icon: Video },
];

export default function Sidebar({
  user,
  active,
  onNavigate,
}) {
  return (
    <aside className="fixed top-0 left-0 h-screen w-52 bg-[#101b3a] border-r border-[#24345e] text-slate-100 flex flex-col justify-between z-40 overflow-y-auto transition-colors duration-200">
      <div className="py-6">
        {/* Brand Header */}
        <div className="flex items-center gap-2.5 px-4 pb-5">
          <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center shrink-0 shadow-md">
            <Brain size={18} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-tight">
              ClipMind AI
            </p>
            <p className="text-[9px] font-semibold text-slate-400 tracking-widest uppercase">
              Intelligence Hub
            </p>
          </div>
        </div>

        {/* User Card */}
        <div className="mx-3 mb-5 flex items-center gap-2.5 bg-[#19264b] border border-[#2b3b67] rounded-xl p-2.5 shadow-sm">
          <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white truncate">
              {user?.name || "User"}
            </p>
            <span className="text-[9px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded-full">
              Content Creator
            </span>
          </div>
        </div>

        {/* Main Navigation Items */}
        <nav className="px-3 space-y-1">
          {MAIN_NAV_ITEMS.map((item) => {
            const isActive = active === item.key;
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                onClick={() =>
                  onNavigate(item.key, { clearVideo: item.key === "library" })
                }
                className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-indigo-600 text-white font-bold shadow-sm"
                    : "text-slate-300 hover:bg-[#24345e] hover:text-white"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Icon size={15} />
                  {item.label}
                </span>
              </button>
            );
          })}

          <button
            onClick={() => onNavigate("settings")}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
              active === "settings"
                ? "bg-indigo-600 text-white font-bold shadow-sm"
                : "text-slate-300 hover:bg-[#24345e] hover:text-white"
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
