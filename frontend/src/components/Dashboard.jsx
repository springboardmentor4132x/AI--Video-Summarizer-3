<<<<<<< HEAD
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
=======
import React, { useEffect, useState } from "react";
import { Activity, Clock3, FileText, Film, Plus, Sparkles, Tags } from "lucide-react";
import {
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
import { apiClient } from "../api/client";

const CHART_COLORS = ["#F0A202", "#2F855A", "#C0392B", "#6B6F76"];

const formatDuration = (totalSeconds) => {
  if (!totalSeconds) return "0m";
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return mins === 0 ? `${secs}s` : `${mins}m ${secs}s`;
};

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const shorten = (text, length = 18) => (text.length > length ? `${text.slice(0, length)}…` : text);

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="dashboard-tooltip">
      {label && <p style={{ margin: "0 0 4px", color: "var(--text-muted)" }}>{label}</p>}
      <strong style={{ color: payload[0].color || "var(--accent)" }}>{payload[0].value}</strong>
    </div>
  );
}

function TopicTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const topic = payload[0].payload;
  return (
    <div className="dashboard-tooltip" style={{ minWidth: "170px" }}>
      <p style={{ margin: "0 0 5px", color: "var(--text)", fontWeight: "700" }}>{topic.text}</p>
      <p style={{ margin: 0, color: "var(--text-muted)" }}>{formatTime(topic.start_time)} - {formatTime(topic.end_time)}</p>
      <strong style={{ display: "block", marginTop: "5px", color: "#A89BE2" }}>{formatTime(topic.duration)} duration</strong>
    </div>
  );
}

function EmptyChart({ text }) {
  return <div style={{ height: "230px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: "12px", textAlign: "center", padding: "20px" }}>{text}</div>;
}

export default function Dashboard({ user, onUploadClick }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await apiClient.get("/analytics", {
          headers: { authorization: `Bearer ${token}` },
        });
        setAnalytics(response.data);
      } catch {
        setError("Couldn’t load analytics right now.");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const cardStyle = {
    background: "var(--bg-elevated)",
    border: "1px solid var(--border)",
    borderRadius: "10px",
    padding: "20px",
  };
  const recentVideos = analytics?.recent_videos || [];
  const keywords = analytics?.top_keywords || [];
  const topics = analytics?.top_topics || [];
  const statusData = [
    { name: "Processed", value: recentVideos.filter((video) => video.status === "processed").length },
    { name: "Processing", value: recentVideos.filter((video) => video.status === "processing").length },
    { name: "Failed", value: recentVideos.filter((video) => video.status === "failed").length },
  ].filter((item) => item.value > 0);
  const activityData = recentVideos.slice().reverse().map((video) => ({
    name: shorten(video.filename, 14),
    minutes: Math.round((video.duration_seconds || 0) / 60),
  }));
  const topicData = topics.map((topic) => ({
    name: `Topic ${topic.topic_id}`,
    text: topic.text ? (topic.text.length > 42 ? `${topic.text.slice(0, 42)}…` : topic.text) : `Topic ${topic.topic_id}`,
    start_time: topic.start_time,
    end_time: topic.end_time,
    duration: topic.duration,
  }));
  const stats = analytics ? [
    { label: "Videos uploaded", value: analytics.videos_uploaded, icon: Film, tone: "var(--accent)" },
    { label: "Transcripts generated", value: analytics.transcripts_completed, icon: FileText, tone: "var(--success)" },
    { label: "Summaries created", value: analytics.summaries_completed, icon: Sparkles, tone: "#C57C00" },
    { label: "Topics detected", value: analytics.total_topics_detected, icon: Tags, tone: "#7D6AC7" },
    { label: "Total watch time", value: formatDuration(analytics.total_duration_seconds), icon: Clock3, tone: "#4D8DA8" },
  ] : [];

  const sectionTitle = (title, detail) => (
    <div style={{ marginBottom: "18px" }}>
      <p style={{ color: "var(--text)", fontSize: "15px", fontWeight: "700", margin: "0 0 4px" }}>{title}</p>
      <p style={{ color: "var(--text-muted)", fontSize: "12px", margin: 0 }}>{detail}</p>
    </div>
  );

  const statusColor = (status) => ({
    processed: "var(--success)",
    processing: "var(--warning)",
    failed: "var(--danger)",
  }[status] || "var(--text-muted)");

  return (
    <div className="dashboard-page" style={{ padding: "34px clamp(20px, 4vw, 52px)", maxWidth: "1240px", width: "100%" }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "20px", flexWrap: "wrap", marginBottom: "28px" }}>
        <div>
          <p style={{ color: "var(--accent)", fontSize: "10px", fontWeight: "800", letterSpacing: "0.12em", margin: "0 0 8px" }}>YOUR CONTENT PULSE</p>
          <h1 style={{ fontSize: "clamp(24px, 4vw, 32px)", fontWeight: "750", color: "var(--text)", margin: "0 0 6px" }}>Welcome back, {user?.name || "there"}</h1>
          <p style={{ fontSize: "14px", color: "var(--text-muted)", margin: 0 }}>A quick read on everything ClipMind has understood so far.</p>
        </div>
        <button onClick={onUploadClick} style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "var(--accent)", color: "var(--accent-text)", border: "none", borderRadius: "8px", padding: "11px 16px", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}><Plus size={16} /> New video</button>
      </div>

      {loading && <div className="dashboard-card" style={{ ...cardStyle, color: "var(--text-muted)", fontSize: "13px" }}>Loading your content pulse…</div>}
      {error && <div className="dashboard-card" style={{ ...cardStyle, color: "var(--danger)", fontSize: "13px" }}>{error}</div>}

      {analytics && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(165px, 1fr))", gap: "12px", marginBottom: "18px" }}>
            {stats.map(({ label, value, icon: Icon, tone }) => (
              <div key={label} className="dashboard-card" style={{ ...cardStyle, padding: "16px" }}>
                <div style={{ width: "30px", height: "30px", display: "flex", alignItems: "center", justifyContent: "center", background: `color-mix(in srgb, ${tone} 14%, transparent)`, borderRadius: "7px", color: tone, marginBottom: "16px" }}><Icon size={16} /></div>
                <p style={{ color: "var(--text)", fontSize: "23px", fontWeight: "750", margin: "0 0 3px" }}>{value}</p>
                <p style={{ color: "var(--text-muted)", fontSize: "11px", margin: 0 }}>{label}</p>
              </div>
            ))}
          </div>

          <div className="dashboard-chart-row" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.4fr) minmax(260px, 0.8fr)", gap: "18px", marginBottom: "18px" }}>
            <div className="dashboard-card" style={cardStyle}>
              {sectionTitle("Recent activity", "Video length across your latest uploads")}
              {activityData.length > 0 ? (
                <ResponsiveContainer width="100%" height={230}>
                  <BarChart data={activityData} margin={{ top: 6, right: 8, left: -22, bottom: 4 }}>
                    <CartesianGrid stroke="var(--border)" vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fill: "var(--text-muted)", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "var(--text-muted)", fontSize: 10 }} axisLine={false} tickLine={false} unit="m" />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(240, 162, 2, 0.06)" }} />
                    <Bar dataKey="minutes" fill="var(--accent)" activeBar={{ fill: "#FFC44D", opacity: 0.92 }} radius={[5, 5, 0, 0]} maxBarSize={34} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <EmptyChart text="Upload videos to see activity here." />}
            </div>

            <div className="dashboard-card" style={cardStyle}>
              {sectionTitle("Processing health", "Status of your five latest videos")}
              {statusData.length > 0 ? (
                <div style={{ position: "relative", height: "230px" }}>
                  <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={statusData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={82} paddingAngle={3} stroke="none">{statusData.map((entry, index) => <Cell key={entry.name} fill={CHART_COLORS[index]} />)}</Pie><Tooltip content={<ChartTooltip />} /></PieChart></ResponsiveContainer>
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", pointerEvents: "none" }}><strong style={{ color: "var(--text)", fontSize: "24px" }}>{recentVideos.length}</strong><span style={{ color: "var(--text-muted)", fontSize: "10px" }}>latest videos</span></div>
                  <div style={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap", marginTop: "-20px", position: "relative" }}>{statusData.map((item, index) => <span key={item.name} style={{ color: "var(--text-muted)", fontSize: "10px" }}><i style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", background: CHART_COLORS[index], marginRight: "4px" }} />{item.name} {item.value}</span>)}</div>
                </div>
              ) : <EmptyChart text="Processing status will appear here." />}
            </div>
          </div>

          <div className="dashboard-chart-row dashboard-analysis-row" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: "18px", marginBottom: "18px" }}>
            <div className="dashboard-card" style={cardStyle}>
              {sectionTitle("Most discussed keywords", "Terms appearing most often in your videos")}
              {keywords.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}><BarChart data={keywords} layout="vertical" margin={{ top: 4, right: 12, left: 8, bottom: 4 }}><CartesianGrid stroke="var(--border)" horizontal={false} strokeDasharray="3 3" /><XAxis type="number" allowDecimals={false} hide /><YAxis dataKey="keyword" type="category" width={74} tick={{ fill: "var(--text-muted)", fontSize: 10 }} axisLine={false} tickLine={false} /><Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(77, 141, 168, 0.06)" }} /><Bar dataKey="count" fill="#4D8DA8" activeBar={{ fill: "#78B8CC", opacity: 0.92 }} radius={[0, 5, 5, 0]} maxBarSize={18} /></BarChart></ResponsiveContainer>
              ) : <EmptyChart text="Keywords will appear after your first analysis." />}
            </div>

            <div className="dashboard-card" style={cardStyle}>
              {sectionTitle("Longest key moments", "Compare the topics that occupy the most video time")}
              {topicData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}><BarChart data={topicData} layout="vertical" margin={{ top: 4, right: 18, left: 12, bottom: 4 }}><CartesianGrid stroke="var(--border)" horizontal={false} strokeDasharray="3 3" /><XAxis type="number" tick={{ fill: "var(--text-muted)", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={formatTime} label={{ value: "Duration", position: "insideBottom", offset: -2, fill: "var(--text-muted)", fontSize: 10 }} /><YAxis type="category" dataKey="text" width={150} tick={{ fill: "var(--text-muted)", fontSize: 10 }} axisLine={false} tickLine={false} /><Tooltip content={<TopicTooltip />} cursor={{ fill: "rgba(125, 106, 199, 0.06)" }} /><Bar dataKey="duration" fill="#7D6AC7" activeBar={{ fill: "#A89BE2", opacity: 0.92 }} radius={[0, 5, 5, 0]} maxBarSize={22} /></BarChart></ResponsiveContainer>
              ) : <EmptyChart text="Key moments will appear after your first analysis." />}
            </div>
          </div>

          <div className="dashboard-card" style={{ ...cardStyle, marginBottom: "18px" }}>
            {sectionTitle("Recent videos", "Your latest uploads and their processing status")}
            {recentVideos.length > 0 ? <div style={{ display: "flex", flexDirection: "column" }}>{recentVideos.map((video, index) => <div key={video.id} className="dashboard-log" style={{ display: "flex", alignItems: "center", gap: "14px", padding: "12px 8px", borderBottom: index < recentVideos.length - 1 ? "1px solid var(--border)" : "none" }}><div style={{ width: "34px", height: "34px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)", background: "var(--accent-bg)", borderRadius: "7px", flexShrink: 0 }}><Film size={16} /></div><div style={{ minWidth: 0, flex: 1 }}><p style={{ color: "var(--text)", fontSize: "13px", fontWeight: "650", margin: "0 0 3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{video.filename}</p><p style={{ color: "var(--text-muted)", fontSize: "11px", margin: 0 }}>{video.duration_seconds ? formatDuration(video.duration_seconds) : "Duration unavailable"}{video.uploaded_at && ` · ${new Date(video.uploaded_at).toLocaleDateString()}`}</p></div><span style={{ color: statusColor(video.status), fontSize: "10px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.06em" }}>{video.status}</span></div>)}</div> : <EmptyChart text="Your uploaded videos will appear here." />}
          </div>

          <div style={{ ...cardStyle, display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap", background: "var(--bg-sidebar)", borderColor: "var(--bg-sidebar)" }}>
            <div><p style={{ color: "#F4F3EF", fontSize: "15px", fontWeight: "700", margin: "0 0 4px" }}>Turn the next video into insight.</p><p style={{ color: "#A8ABB3", fontSize: "12px", margin: 0 }}>Upload an MP4 to create a transcript, key moments, and summary.</p></div>
            <button onClick={onUploadClick} style={{ display: "inline-flex", alignItems: "center", gap: "7px", background: "var(--accent)", color: "var(--accent-text)", border: "none", borderRadius: "7px", padding: "10px 14px", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}><Activity size={14} /> Analyze video</button>
          </div>
        </>
      )}
>>>>>>> 6405c7b05fdff16e70d270d71c6b9e81127d6f7e
    </div>
  );
}
