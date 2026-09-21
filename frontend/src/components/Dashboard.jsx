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
  TrendingUp,
  Clock3,
  Layers3,
  ArrowUpRight,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
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
    tag: null,
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

const chartTooltipStyle = {
  backgroundColor: "rgba(15, 23, 42, 0.96)",
  border: "1px solid rgba(148, 163, 184, 0.2)",
  borderRadius: 12,
  color: "#f8fafc",
};

const PIE_COLORS = ["#8b5cf6", "#22c55e", "#38bdf8", "#f59e0b"];

function formatSeconds(totalSeconds) {
  if (!totalSeconds && totalSeconds !== 0) return "0m";
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function buildTrendData(recentVideos) {
  const last7Days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    return {
      name: date.toLocaleDateString("en-US", { weekday: "short" }),
      count: 0,
    };
  });

  recentVideos.forEach((video) => {
    if (!video.uploaded_at) return;
    const date = new Date(video.uploaded_at);
    const label = date.toLocaleDateString("en-US", { weekday: "short" });
    const day = last7Days.find((item) => item.name === label);
    if (day) day.count += 1;
  });

  return last7Days;
}

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
  const topKeywords = analytics?.top_keywords || [];
  const topTopics = analytics?.top_topics || [];
  const totalDurationSeconds = analytics?.total_duration_seconds ?? 0;
  const transcriptsCompleted = analytics?.transcripts_completed ?? 0;
  const summariesCompleted = analytics?.summaries_completed ?? 0;
  const totalTopicsDetected = analytics?.total_topics_detected ?? 0;

  const activePipelines = recentVideos.filter((video) => video.status === "processing").length;
  const processedVideos = recentVideos.filter((video) => video.status === "processed").length;
  const transcriptRatio = totalUploaded
    ? Math.round((transcriptsCompleted / totalUploaded) * 100)
    : 0;
  const summaryRatio = totalUploaded
    ? Math.round((summariesCompleted / totalUploaded) * 100)
    : 0;

  const keywordChartData = topKeywords.map((item) => ({
    name: item.keyword,
    value: item.count,
  }));

  const mixData = [
    { name: "Transcripts", value: Math.max(transcriptsCompleted, 0) },
    { name: "Summaries", value: Math.max(summariesCompleted, 0) },
    { name: "Topics", value: Math.max(totalTopicsDetected, 0) },
  ];

  const trendData = buildTrendData(recentVideos);
  const averageDuration = totalUploaded ? Math.round(totalDurationSeconds / totalUploaded) : 0;

  const statCards = [
    {
      color: "blue",
      icon: Upload,
      pillLabel: "Total Uploaded",
      value: loading ? "…" : totalUploaded,
      caption: "Creator video assets",
    },
    {
      color: "orange",
      icon: Activity,
      pillLabel: activePipelines > 0 ? "Active" : "Idle",
      value: loading ? "…" : activePipelines,
      caption: "Live pipeline jobs",
    },
    {
      color: "emerald",
      icon: CheckCircle2,
      pillLabel: "Processed",
      value: loading ? "…" : processedVideos,
      caption: "Ready for analysis",
    },
    {
      color: "fuchsia",
      icon: Clock3,
      pillLabel: "Avg. Duration",
      value: loading ? "…" : formatSeconds(averageDuration),
      caption: "Per uploaded video",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F6F8FC] text-slate-900">
      <div className="flex items-center justify-between gap-4 px-8 pt-6 pb-4">
        <div className="relative w-full max-w-xl">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search videos, topics, moments..."
            className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-10 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:border-violet-300"
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
              <img src={user.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-800 text-white text-xs font-bold flex items-center justify-center">
                {user?.name?.[0]?.toUpperCase() || "U"}
              </div>
            )}
            <span className="text-sm font-medium text-slate-800">{user?.name || "User"}</span>
          </div>
        </div>
      </div>

      <div className="px-8 pb-10 space-y-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-950 via-violet-950 to-fuchsia-950 px-8 py-7 flex items-center justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 bg-white/10 text-white text-xs font-medium px-3 py-1 rounded-full mb-4">
              <CheckCircle2 size={12} className="text-emerald-400" />
              {user?.role || "Content Creator"} Studio
            </span>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Welcome back, <span className="text-fuchsia-400">{user?.name || "there"}</span>!
            </h1>
            <p className="text-sm text-violet-200 mt-2">
              AI content analytics are running across your transcript, summary, and topic pipelines.
            </p>
          </div>

          <button
            onClick={onUploadClick}
            className="hidden sm:inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-blue-500/20 transition-all"
          >
            <Upload size={15} />
            Upload Video
          </button>
        </div>

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {statCards.map((card) => {
            const c = COLOR_MAP[card.color];
            const Icon = card.icon;
            return (
              <div
                key={card.pillLabel}
                className={`bg-white rounded-2xl border-2 ${c.border} p-4 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-8 h-8 rounded-lg ${c.iconBg} ${c.iconText} flex items-center justify-center`}>
                    <Icon size={16} />
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.pill}`}>
                    {card.pillLabel}
                  </span>
                </div>
                <p className="text-2xl font-bold text-slate-900">{card.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{card.caption}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400 font-semibold">Performance</p>
                <h2 className="text-lg font-bold text-slate-900">Upload activity</h2>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold px-2.5 py-1">
                <TrendingUp size={12} />
                +12.4% this week
              </div>
            </div>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="uploadFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.04} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={chartTooltipStyle}
                    formatter={(value) => [`${value} uploads`, "Videos"]}
                  />
                  <Area type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={3} fill="url(#uploadFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400 font-semibold">Coverage</p>
                <h2 className="text-lg font-bold text-slate-900">AI output mix</h2>
              </div>
              <div className="rounded-full bg-slate-100 text-slate-600 text-[11px] font-semibold px-2.5 py-1">
                Live
              </div>
            </div>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mixData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={48}
                    outerRadius={82}
                    paddingAngle={4}
                  >
                    {mixData.map((entry, index) => (
                      <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={chartTooltipStyle}
                    formatter={(value) => [`${value}`, "Count"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
              {mixData.map((item, index) => (
                <div key={item.name} className="flex items-center gap-2 text-slate-600">
                  <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} />
                  {item.name}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400 font-semibold">Keywords</p>
                <h2 className="text-lg font-bold text-slate-900">Top discovery terms</h2>
              </div>
              <div className="inline-flex items-center gap-1.5 text-violet-600 text-[11px] font-semibold">
                <Eye size={13} />
                {topKeywords.length} active
              </div>
            </div>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={keywordChartData} layout="vertical" margin={{ top: 10, right: 8, left: 8, bottom: 0 }}>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="2 2" horizontal={false} />
                  <XAxis type="number" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    width={72}
                    tick={{ fill: '#475569', fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={chartTooltipStyle}
                    formatter={(value) => [`${value} mentions`, "Frequency"]}
                  />
                  <Bar dataKey="value" radius={[0, 8, 8, 0]} fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400 font-semibold">Quality</p>
                <h2 className="text-lg font-bold text-slate-900">Processing health</h2>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold px-2.5 py-1">
                <ArrowUpRight size={12} />
                Stable
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <div className="flex items-center justify-between mb-2 text-sm">
                  <span className="text-slate-600">Transcript completion</span>
                  <span className="font-semibold text-slate-900">{transcriptRatio}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-100">
                  <div className="h-2.5 rounded-full bg-violet-500" style={{ width: `${transcriptRatio}%` }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2 text-sm">
                  <span className="text-slate-600">Summary generation</span>
                  <span className="font-semibold text-slate-900">{summaryRatio}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-100">
                  <div className="h-2.5 rounded-full bg-emerald-500" style={{ width: `${summaryRatio}%` }} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-3">
                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
                  <p className="text-xs text-slate-500">Transcripted</p>
                  <p className="mt-2 text-2xl font-bold text-slate-900">{transcriptsCompleted}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
                  <p className="text-xs text-slate-500">Summaries</p>
                  <p className="mt-2 text-2xl font-bold text-slate-900">{summariesCompleted}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400 font-semibold">Insight</p>
                <h2 className="text-lg font-bold text-slate-900">Top video topics</h2>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 text-violet-700 text-[11px] font-semibold px-2.5 py-1">
                <Layers3 size={12} />
                {totalTopicsDetected} total
              </div>
            </div>

            <div className="space-y-3">
              {topTopics.length > 0 ? (
                topTopics.slice(0, 4).map((topic, index) => (
                  <div key={topic.topic_id ?? index} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-violet-100 text-violet-700 text-[11px] font-bold flex items-center justify-center">
                          {index + 1}
                        </span>
                        <p className="font-semibold text-slate-800">{topic.topic_id ? `Topic ${topic.topic_id}` : `Segment ${index + 1}`}</p>
                      </div>
                      <span className="text-[11px] text-slate-500">{topic.start_time ?? 0}s - {topic.end_time ?? 0}s</span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {topic.text ? (topic.text.length > 150 ? `${topic.text.slice(0, 150)}…` : topic.text) : "No topic summary available yet."}
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
                  Topic signals will appear here after video analysis completes.
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400 font-semibold">Overview</p>
                <h2 className="text-lg font-bold text-slate-900">Library health</h2>
              </div>
              <div className="text-[11px] text-slate-500">{formatSeconds(totalDurationSeconds)}</div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl bg-gradient-to-br from-violet-50 to-fuchsia-50 border border-violet-100 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-violet-600 uppercase tracking-[0.12em]">Total duration</p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">{formatSeconds(totalDurationSeconds)}</p>
                  </div>
                  <div className="w-11 h-11 rounded-2xl bg-violet-500/10 text-violet-600 flex items-center justify-center">
                    <Clock3 size={20} />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs text-slate-500 uppercase tracking-[0.12em]">Recent submission status</p>
                <div className="mt-4 space-y-3">
                  {recentVideos.length > 0 ? (
                    recentVideos.slice(0, 4).map((video) => (
                      <div key={video.id} className="flex items-center justify-between text-sm">
                        <div>
                          <p className="font-medium text-slate-700 truncate max-w-[180px]">{video.filename}</p>
                          <p className="text-[11px] text-slate-500">{video.uploaded_at ? new Date(video.uploaded_at).toLocaleDateString() : "Recently"}</p>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${video.status === "processed" ? "bg-emerald-100 text-emerald-700" : video.status === "processing" ? "bg-amber-100 text-amber-700" : "bg-slate-200 text-slate-600"}`}>
                          {video.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">No recent uploads yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={16} className="text-purple-500" />
            <h2 className="text-base font-bold text-gray-900">{user?.role || "Content Creator"} feature suite</h2>
          </div>
          <p className="text-xs text-gray-500 mb-4">
            Dedicated tools to create, summarize, and distribute knowledge assets.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {FEATURE_CARDS.map((card) => {
              const c = COLOR_MAP[card.color];
              const Icon = card.icon;
              const tag =
                card.title === "Manage Uploaded Videos"
                  ? `${totalUploaded} video${totalUploaded === 1 ? "" : "s"}`
                  : card.tag;

              return (
                <div
                  key={card.title}
                  className="bg-white border border-gray-200 rounded-2xl p-4 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-8 h-8 rounded-lg ${c.iconBg} ${c.iconText} flex items-center justify-center`}>
                      <Icon size={16} />
                    </div>
                    <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                      {tag}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-gray-900">{card.title}</h3>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{card.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
