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
import { UploadHistory } from "./UploadHistory";

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
  const [libraryVideoId, setLibraryVideoId] = useState(null);

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

  if (libraryVideoId) {
    return (
      <div className="dashboard-page" style={{ padding: "34px clamp(20px, 4vw, 52px)", maxWidth: "1240px", width: "100%" }}>
        <UploadHistory
          initialVideoId={libraryVideoId}
          onBack={() => setLibraryVideoId(null)}
        />
      </div>
    );
  }

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

          <UploadHistory onOpenVideo={(videoId) => setLibraryVideoId(videoId)} />

          <div style={{ ...cardStyle, display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap", background: "var(--bg-sidebar)", borderColor: "var(--bg-sidebar)" }}>
            <div><p style={{ color: "#F4F3EF", fontSize: "15px", fontWeight: "700", margin: "0 0 4px" }}>Turn the next video into insight.</p><p style={{ color: "#A8ABB3", fontSize: "12px", margin: 0 }}>Upload an MP4 to create a transcript, key moments, and summary.</p></div>
            <button onClick={onUploadClick} style={{ display: "inline-flex", alignItems: "center", gap: "7px", background: "var(--accent)", color: "var(--accent-text)", border: "none", borderRadius: "7px", padding: "10px 14px", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}><Activity size={14} /> Analyze video</button>
          </div>
        </>
      )}
    </div>
  );
}
