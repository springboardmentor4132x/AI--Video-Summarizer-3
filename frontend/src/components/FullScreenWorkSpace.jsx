import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import apiClient from "../api/client";
import { useReveal } from "../hooks/useReveal";

function timeToSeconds(timeStr) {
  if (typeof timeStr === "number") return timeStr;
  const parts = timeStr.split(":").map(Number);
  return parts.length === 3
    ? parts[0] * 3600 + parts[1] * 60 + parts[2]
    : parts[0] * 60 + parts[1];
}

export function FullScreenWorkspace({ video, onBack }) {
  const videoRef = useRef(null);
  const [topics, setTopics] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const headerIn = useReveal(0);
  const videoIn = useReveal(100);
  const sidebarIn = useReveal(200);

  useEffect(() => {
    if (!video?.id) return;
    const token = localStorage.getItem("token");

    apiClient
      .get(`/videos/${video.id}/insights`, {
        headers: { authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setTopics(res.data.topics || []);
        setKeywords(res.data.keywords || []);
      })
      .catch(() => {
        setError("Couldn't load insights — showing placeholder data.");
        setTopics([
          {
            start_time: "00:00",
            end_time: "02:00",
            topic: "Introduction",
            text: "Opening context for this video.",
          },
          {
            start_time: "02:00",
            end_time: "06:00",
            topic: "Main discussion",
            text: "Core content of the video.",
          },
        ]);
        setKeywords(["placeholder", "no-data-yet"]);
      })
      .finally(() => setLoading(false));
  }, [video?.id]);

  function seekTo(timeStr) {
    if (!videoRef.current) return;
    videoRef.current.currentTime = timeToSeconds(timeStr);
    videoRef.current.play();
  }

  return (
    <div className="h-screen w-screen bg-slate-950 text-slate-100 flex flex-col p-4 overflow-hidden gap-4">
      <button
        onClick={onBack}
        className={`flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-slate-200 hover:-translate-x-0.5 transition-all duration-200 w-fit ${
          headerIn ? "opacity-100" : "opacity-0"
        }`}
      >
        <ArrowLeft size={14} /> Back to dashboard
      </button>

      <div className="flex-1 grid grid-cols-12 gap-4 h-full overflow-hidden">
        <div
          className={`col-span-12 lg:col-span-7 flex flex-col gap-4 h-full transition-all duration-500 ${
            videoIn ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
          }`}
        >
          <div className="flex-1 bg-black/80 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden flex items-center justify-center relative group">
            <video
              ref={videoRef}
              src={video?.file_url}
              className="w-full h-full object-contain"
              controls
            />
          </div>

          <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl flex items-center gap-2 overflow-x-auto">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0">
              Keywords:
            </span>
            {keywords.length > 0 ? (
              keywords.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-indigo-950/80 text-indigo-300 text-xs rounded-full border border-indigo-800/50 hover:border-indigo-400 hover:-translate-y-0.5 hover:shadow-md hover:shadow-indigo-500/10 transition-all duration-200 cursor-default shrink-0"
                >
                  #{tag}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-600">
                {loading ? "Loading…" : "No keywords yet"}
              </span>
            )}
          </div>
        </div>

        <div
          className={`col-span-12 lg:col-span-5 bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex flex-col h-full overflow-hidden transition-all duration-500 ${
            sidebarIn ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
          }`}
        >
          <h3 className="text-md font-bold mb-1 text-slate-200">
            Topics &amp; Key Moments
          </h3>
          {error && <p className="text-[11px] text-amber-500 mb-2">{error}</p>}

          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {loading ? (
              <p className="text-xs text-slate-500">Loading topics…</p>
            ) : (
              topics.map((t, i) => (
                <TopicCard
                  key={`${t.start_time}-${i}`}
                  topic={t}
                  index={i}
                  onSeek={() => seekTo(t.start_time)}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TopicCard({ topic, index, onSeek }) {
  const isIn = useReveal(250 + index * 90);

  return (
    <button
      onClick={onSeek}
      className={`w-full text-left p-3 bg-slate-900/80 border border-slate-800/80 rounded-xl hover:border-indigo-500/50 hover:bg-slate-800/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer ${
        isIn ? "opacity-100 translate-x-0" : "opacity-0 translate-x-3"
      }`}
    >
      <span className="text-xs font-mono text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded">
        {topic.start_time} - {topic.end_time}
      </span>
      <p className="text-sm font-semibold text-slate-200 mt-1">{topic.topic}</p>
      {topic.text && (
        <p className="text-xs text-slate-400 line-clamp-2 mt-1">{topic.text}</p>
      )}
    </button>
  );
}
