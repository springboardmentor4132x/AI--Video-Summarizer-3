import React, { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle, FileText, Loader2, Play } from "lucide-react";
import apiClient from "../api/client";

function formatDuration(seconds) {
  const totalSeconds = Math.max(0, Math.floor(seconds || 0));
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;
  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

function statusLabel(status) {
  return (status || "unknown").replaceAll("_", " ");
}

export function UploadHistory({ initialVideoId, onOpenVideo, onBack, subTab = "detail" }) {
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [videoDetail, setVideoDetail] = useState(null);
  const [mediaUrl, setMediaUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const fetchVideos = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await apiClient.get("/videos/me");
        if (cancelled) return;
        const videoData = response.data.videos || [];
        setVideos(videoData);

        if (initialVideoId) {
          const matched = videoData.find(
            (video) => String(video.id) === String(initialVideoId),
          );
          if (matched) setSelectedVideo(matched);
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(
            requestError.response?.data?.detail ||
              "Could not load your video library.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchVideos();
    return () => {
      cancelled = true;
    };
  }, [initialVideoId]);

  useEffect(() => {
    if (!selectedVideo) return undefined;

    let cancelled = false;
    let objectUrl = "";

    const fetchVideoDetail = async () => {
      setDetailLoading(true);
      setError("");
      try {
        const detailResponse = await apiClient.get(`/videos/${selectedVideo.id}`);
        if (cancelled) return;
        setVideoDetail(detailResponse.data);

        try {
          const mediaResponse = await apiClient.get(
            `/videos/${selectedVideo.id}/media`,
            { responseType: "blob" },
          );
          if (!cancelled) {
            objectUrl = URL.createObjectURL(mediaResponse.data);
            setMediaUrl(objectUrl);
          }
        } catch {
          if (!cancelled) setError("The transcript loaded, but the stored video could not be played.");
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(
            requestError.response?.data?.detail ||
              "Could not open the stored video.",
          );
        }
      } finally {
        if (!cancelled) setDetailLoading(false);
      }
    };

    fetchVideoDetail();
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      setVideoDetail(null);
      setMediaUrl("");
    };
  }, [selectedVideo]);

  const handleSelect = (video) => {
    setSelectedVideo(video);
    if (onOpenVideo) onOpenVideo(video.id);
  };

  const handleBackToList = () => {
    setSelectedVideo(null);
    setVideoDetail(null);
    setMediaUrl("");
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

  if (selectedVideo) {
    const transcript = videoDetail?.transcript?.text || "";
    const topics = videoDetail?.topics || [];
    const keywords = videoDetail?.keywords || [];

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-6 md:p-8 space-y-6">
        <button
          onClick={handleBackToList}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-emerald-600 transition"
        >
          <ArrowLeft size={14} /> Back to My Videos
        </button>

        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">
            {selectedVideo.filename}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Uploaded video and previously generated transcript
          </p>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
        {detailLoading && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 className="animate-spin" size={16} /> Opening stored video...
          </div>
        )}

        {videoDetail && !detailLoading && (
          <div className="space-y-6">
            {subTab === "detail" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 bg-black rounded-2xl overflow-hidden aspect-video flex items-center justify-center">
                  <video controls src={mediaUrl} className="w-full h-full object-contain" />
                </div>
                <div className="lg:col-span-4 space-y-4">
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl text-xs flex items-center gap-2">
                    <CheckCircle size={16} /> Transcript stored successfully
                  </div>
                  <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
                    <h2 className="text-xs font-bold mb-3">Video information</h2>
                    <p className="text-xs text-slate-500">Status: {statusLabel(videoDetail.status)}</p>
                    <p className="text-xs text-slate-500 mt-2">
                      Duration: {formatDuration(videoDetail.duration_seconds)}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <FileText size={16} className="text-emerald-500" />
                      <h2 className="text-xs font-bold">Transcript</h2>
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      <p className="text-xs leading-relaxed whitespace-pre-wrap text-slate-600 dark:text-slate-300">
                        {transcript || "No stored transcript is available."}
                      </p>
                    </div>
                    {keywords.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-slate-200 dark:border-slate-800">
                        {keywords.map((keyword) => (
                          <span key={keyword} className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {subTab === "transcript" && (
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <FileText size={18} className="text-emerald-500" />
                  <h2 className="text-xl font-extrabold">Transcript</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {keywords.map((keyword) => (
                    <span key={keyword} className="text-xs bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                      {keyword}
                    </span>
                  ))}
                </div>
                <p className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl leading-relaxed text-sm whitespace-pre-wrap">
                  {transcript || "No stored transcript is available."}
                </p>
              </section>
            )}

            {subTab === "summary" && (
              <section className="space-y-4">
                <h2 className="text-xl font-extrabold">Summary</h2>
                <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl text-sm whitespace-pre-wrap">
                  {videoDetail.summary?.detailed_summary || videoDetail.summary?.short_summary || "No summary has been generated for this video yet."}
                </div>
              </section>
            )}

            {subTab === "key-moments" && (
              <section className="space-y-4">
                <h2 className="text-xl font-extrabold">Key Moments</h2>
                <div className="space-y-2">
                  {topics.length ? topics.map((topic) => (
                    <div key={`${topic.topic_id}-${topic.start_time}`} className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-4 rounded-xl">
                      <p className="text-xs font-bold">{formatDuration(topic.start_time)} - {formatDuration(topic.end_time)}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{topic.text}</p>
                    </div>
                  )) : <p className="text-sm text-slate-500">No key moments were stored.</p>}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-6 md:p-10 max-w-6xl mx-auto space-y-6">
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">My Videos</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Your 20 most recent uploaded videos and their generated transcripts.
        </p>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
      {videos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <button
              type="button"
              key={video.id}
              onClick={() => handleSelect(video)}
              className="group text-left bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer"
            >
              <div className="aspect-video bg-slate-950 relative flex items-center justify-center">
                <Play size={28} className="text-white fill-current opacity-80 group-hover:scale-110 transition-transform" />
                <span className="absolute top-3 right-3 text-[10px] uppercase font-bold bg-black/60 text-white px-2 py-1 rounded">
                  {statusLabel(video.status)}
                </span>
              </div>
              <div className="p-4">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{video.filename}</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  {video.duration_seconds ? `${formatDuration(video.duration_seconds)} · ` : ""}
                  Click to open video and transcript
                </p>
              </div>
            </button>
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