import React, { useState, useEffect } from "react";
import {
  Search,
  SlidersHorizontal,
  Bell,
  Upload,
  Activity,
  CheckCircle2,
  Eye,
  Sparkles,
  Video,
  FileText,
} from "lucide-react";
import apiClient from "../api/client";

const FEATURE_CARDS = [
  {
    icon: Upload,
    color: "blue",
    tag: "Fast GPU Ingest",
    title: "Upload Videos",
    desc: "Ingest raw video footage into the AI pipeline",
  },
  {
    icon: Video,
    color: "fuchsia",
    tag: null, // filled dynamically from real video count
    title: "Manage Uploaded Videos",
    desc: "Edit metadata, publish status, or delete items",
  },
  {
    icon: FileText,
    color: "emerald",
    tag: "Whisper AI",
    title: "Generate Transcripts",
    desc: "Auto-extract text with word-level timestamps",
  },
  {
    icon: SlidersHorizontal,
    color: "purple",
    tag: "GPT-4",
    title: "Generate AI Summaries",
    desc: "Extract executive bullet points and key moments automatically",
  },
];

const COLOR_MAP = {
  blue: {
    border: "border-blue-400",
    iconBg: "bg-blue-50",
    iconText: "text-blue-500",
    pill: "bg-blue-50 text-blue-600",
  },
  orange: {
    border: "border-orange-400",
    iconBg: "bg-orange-50",
    iconText: "text-orange-500",
    pill: "bg-orange-50 text-orange-600",
  },
  emerald: {
    border: "border-emerald-400",
    iconBg: "bg-emerald-50",
    iconText: "text-emerald-500",
    pill: "bg-emerald-50 text-emerald-600",
  },
  fuchsia: {
    border: "border-fuchsia-400",
    iconBg: "bg-fuchsia-50",
    iconText: "text-fuchsia-500",
    pill: "bg-fuchsia-50 text-fuchsia-600",
  },
  purple: {
    border: "border-purple-400",
    iconBg: "bg-purple-50",
    iconText: "text-purple-500",
    pill: "bg-purple-50 text-purple-600",
  },
};

export default function Dashboard({ user, onUploadClick }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    apiClient
      .get("/analytics", { headers: { authorization: `Bearer ${token}` } })
      .then((res) => setAnalytics(res.data))
      .catch(() => setAnalytics(null))
      .finally(() => setLoading(false));
  }, []);

  const totalUploaded = analytics?.videos_uploaded ?? 0;
  const recentVideos = analytics?.recent_videos || [];
  const activePipelines = recentVideos.filter(
    (v) => v.status === "processing",
  ).length;
  const completed = recentVideos.filter((v) => v.status === "processed").length;
  // TODO(backend): no view-tracking column exists yet on Video/Transcript —
  // this stays a placeholder until that's added and /analytics returns it.
  const totalViews = analytics?.total_views ?? "—";

  const statCards = [
    {
      color: "blue",
      icon: Upload,
      pillLabel: "Total Uploaded",
      value: loading ? "…" : totalUploaded,
      caption: "Creator Video Assets",
    },
    {
      color: "orange",
      icon: Activity,
      pillLabel: activePipelines > 0 ? "Active" : "Idle",
      value: loading ? "…" : activePipelines,
      caption: "Active Pipelines",
    },
    {
      color: "emerald",
      icon: CheckCircle2,
      pillLabel: "Completed",
      value: loading ? "…" : completed,
      caption: "Ready for Audience",
    },
    {
      color: "fuchsia",
      icon: Eye,
      pillLabel: "Views Insight",
      value: totalViews,
      caption: "Total Video Views",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7F7F9]">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4 px-8 pt-6 pb-4">
        <div className="relative w-full max-w-xl">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search videos, topics, moments..."
            className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-10 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:border-gray-300"
          />
          <SlidersHorizontal
            size={15}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
            <Bell size={16} className="text-gray-500" />
          </button>

          <div className="flex items-center gap-2">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt=""
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-800 text-white text-xs font-bold flex items-center justify-center">
                {user?.name?.[0]?.toUpperCase() || "U"}
              </div>
            )}
            <span className="text-sm font-medium text-gray-800">
              {user?.name || "User"}
            </span>
          </div>
        </div>
      </div>
      <div className="px-8 pb-10 space-y-6">
        {/* Hero banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-950 via-purple-900 to-fuchsia-950 px-8 py-7 flex items-center justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 bg-white/10 text-white text-xs font-medium px-3 py-1 rounded-full mb-4">
              <CheckCircle2 size={12} className="text-emerald-400" />
              {user?.role || "Content Creator"} Studio
            </span>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Welcome back,{" "}
              <span className="text-fuchsia-400">{user?.name || "there"}</span>!
            </h1>
            <p className="text-sm text-purple-200 mt-2">
              Purpose: Create and manage summarized content for audiences.
            </p>
          </div>
          <button
            onClick={onUploadClick}
            className="hidden sm:inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-blue-500/20 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all shrink-0"
          >
            <Upload size={15} />
            Upload Video
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card) => {
            const c = COLOR_MAP[card.color];
            const Icon = card.icon;
            return (
              <div
                key={card.pillLabel}
                className={`bg-white rounded-2xl border-2 ${c.border} p-4 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-8 h-8 rounded-lg ${c.iconBg} ${c.iconText} flex items-center justify-center`}
                  >
                    <Icon size={16} />
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.pill}`}
                  >
                    {card.pillLabel}
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{card.caption}</p>
              </div>
            );
          })}
        </div>

        {/* Feature suite */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={16} className="text-purple-500" />
            <h2 className="text-base font-bold text-gray-900">
              {user?.role || "Content Creator"} Feature Suite
            </h2>
          </div>
          <p className="text-xs text-gray-500 mb-4">
            Dedicated tools to create, summarize, and distribute knowledge
            assets.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURE_CARDS.map((card) => {
              const c = COLOR_MAP[card.color];
              const Icon = card.icon;
              const tag =
                card.title === "Manage Uploaded Videos"
                  ? `${totalUploaded} Video${totalUploaded === 1 ? "" : "s"}`
                  : card.tag;
              return (
                <div
                  key={card.title}
                  className="bg-white rounded-2xl border border-gray-200 p-4 hover:-translate-y-0.5 hover:shadow-md hover:border-gray-300 transition-all duration-200 cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-8 h-8 rounded-lg ${c.iconBg} ${c.iconText} flex items-center justify-center`}
                    >
                      <Icon size={16} />
                    </div>
                    <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                      {tag}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-gray-900">
                    {card.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    {card.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
