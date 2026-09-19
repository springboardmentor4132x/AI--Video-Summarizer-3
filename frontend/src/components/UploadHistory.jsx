import React, { useState, useEffect } from "react";
import {
  Play,
  ArrowLeft,
  FileText,
  Download,
  Edit3,
  Bookmark,
  Share2,
  BarChart2,
  Clock,
  CheckCircle,
  Loader2,
} from "lucide-react";
import apiClient from "../api/client";

export function UploadHistory({
  initialVideoId,
  onOpenVideo,
  onBack,
  subTab = "detail",
}) {
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await apiClient.get("/videos", {
          headers: { authorization: `Bearer ${token}` },
        });
        const videoData = response.data || [];
        setVideos(videoData);

        if (initialVideoId) {
          const matched = videoData.find(
            (v) => String(v.id) === String(initialVideoId),
          );
          if (matched) setSelectedVideo(matched);
        }
      } catch (err) {
        console.error("Failed to load videos", err);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, [initialVideoId]);

  const handleSelect = (video) => {
    setSelectedVideo(video);
    if (onOpenVideo) onOpenVideo(video.id);
  };

  const handleBackToList = () => {
    setSelectedVideo(null);
    if (onBack) onBack();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400 space-y-3">
        <Loader2 className="animate-spin text-emerald-500" size={24} />
        <p className="text-xs">Fetching video library...</p>
      </div>
    );
  }

  // --- VIEW 1: VIDEO DETAIL & SUB-VIEWS (MATCHING SCREENSHOTS) ---
  if (selectedVideo) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-6 md:p-8 space-y-6">
        {/* Back Button Header */}
        <button
          onClick={handleBackToList}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-emerald-600 transition"
        >
          <ArrowLeft size={14} /> Back to Video
        </button>

        {/* SUB TAB 1: VIDEO DETAIL */}
        {subTab === "detail" && (
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">
                  {selectedVideo.filename ||
                    selectedVideo.title ||
                    "Physics Lecture - 1"}
                </h1>
                <p className="text-xs text-slate-500 mt-1">Physics</p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button className="inline-flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs px-3 py-1.5 rounded-lg shadow-sm">
                  <Download size={13} /> PDF Report
                </button>
                <button className="inline-flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs px-3 py-1.5 rounded-lg shadow-sm">
                  <Download size={13} /> CSV Report
                </button>
              </div>
            </div>

            {/* Video Player & Context Panel Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 bg-black rounded-2xl overflow-hidden aspect-video relative flex items-center justify-center">
                <video
                  controls
                  src={selectedVideo.url || selectedVideo.video_url}
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="lg:col-span-4 space-y-4">
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl text-xs flex items-center gap-2">
                  <CheckCircle size={16} /> All AI processing complete
                </div>

                <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 space-y-3">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                    Key Moments
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800/60">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        Introduction to Physics Concepts
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        0:00 - 0:14 · 24%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUB TAB 2: TRANSCRIPT */}
        {subTab === "transcript" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  Transcript
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  {selectedVideo.filename}
                </p>
              </div>
              <button className="inline-flex items-center gap-1.5 bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md">
                <Edit3 size={14} /> Edit Transcript
              </button>
            </div>

            {/* Keyword Tags */}
            <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Keywords
              </span>
              <div className="flex flex-wrap gap-2">
                {["speed", "distance", "physics", "average", "time"].map(
                  (kw) => (
                    <span
                      key={kw}
                      className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg"
                    >
                      {kw}
                    </span>
                  ),
                )}
              </div>
            </div>

            {/* Transcript Text Box */}
            <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl leading-relaxed text-xs text-slate-700 dark:text-slate-300 space-y-4">
              <p>
                {selectedVideo.transcript ||
                  "What is going on guys? Welcome to your very first lesson in physics. Today we are going to talk about motion, speed, and distance over time..."}
              </p>
            </div>
          </div>
        )}

        {/* SUB TAB 3: ANALYTICS */}
        {subTab === "analytics" && (
          <div className="space-y-6">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Video Analytics
            </h1>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl">
                <p className="text-xs text-slate-500">Total Views</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  15
                </p>
              </div>
              <div className="p-4 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl">
                <p className="text-xs text-slate-500">Watch Time (min)</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  32
                </p>
              </div>
              <div className="p-4 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl">
                <p className="text-xs text-slate-500 font-medium">
                  Completion Rate
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  99%
                </p>
              </div>
              <div className="p-4 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl">
                <p className="text-xs text-slate-500">Key Moments</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  7
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SUB TAB 4: NOTES */}
        {subTab === "notes" && (
          <div className="space-y-6">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Video Notes
            </h1>
            <div className="p-6 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase">
                Summary Note
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {selectedVideo.summary ||
                  "Summary notes generated for this video will appear here."}
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- VIEW 2: MY VIDEOS GRID (DEFAULT OVERVIEW) ---
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-6 md:p-10 max-w-6xl mx-auto space-y-6">
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          My Videos
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Select a video to access transcript, key moments, and AI analytics.
        </p>
      </div>

      {videos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((vid) => (
            <div
              key={vid.id}
              onClick={() => handleSelect(vid)}
              className="group bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer"
            >
              <div className="aspect-video bg-slate-950 relative">
                <img
                  src={
                    vid.thumbnail ||
                    "https://placehold.co/600x400/0f172a/64748b?text=Uploaded+Video"
                  }
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-slate-950/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play size={20} className="text-white fill-current" />
                </div>
              </div>
              <div className="p-4">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {vid.filename}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Status: {vid.status || "Processed"}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center text-xs text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
          No uploaded videos available yet.
        </div>
      )}
    </div>
  );
}
