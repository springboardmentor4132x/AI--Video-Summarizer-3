import React, { useState, useEffect } from "react";
import { Play, Trash2, Clock, Search, Film, AlertCircle } from "lucide-react";
import apiClient from "../api/client";

export default function History({ onSelectVideo }) {
  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await apiClient.get("/history", {
          headers: { authorization: `Bearer ${token}` },
        });
        setHistoryItems(response.data || []);
      } catch (error) {
        console.error("Failed to fetch history", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const handleRemoveItem = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await apiClient.delete(`/history/${id}`, {
        headers: { authorization: `Bearer ${token}` },
      });
      setHistoryItems((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Failed to delete history item", error);
    }
  };

  const handleClearAll = async () => {
    if (window.confirm("Are you sure you want to clear your watch history?")) {
      try {
        const token = localStorage.getItem("token");
        await apiClient.delete("/history", {
          headers: { authorization: `Bearer ${token}` },
        });
        setHistoryItems([]);
      } catch (error) {
        console.error("Failed to clear history", error);
      }
    }
  };

  const filteredItems = historyItems.filter((item) =>
    item.title?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-6 md:p-10 max-w-6xl mx-auto space-y-6 transition-colors duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Watch History
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Access and re-analyze all your previously processed and viewed video
            clips.
          </p>
        </div>

        {historyItems.length > 0 && (
          <button
            onClick={handleClearAll}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 transition self-start sm:self-auto"
          >
            <Trash2 size={14} /> Clear History
          </button>
        )}
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400">
          Loading history...
        </div>
      ) : filteredItems.length > 0 ? (
        <>
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Search watched videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 shadow-sm dark:shadow-none transition"
            />
            <Search
              size={16}
              className="absolute left-3.5 top-3 text-slate-400 dark:text-slate-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((video) => (
              <div
                key={video.id}
                className="group bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm dark:shadow-none hover:shadow-lg dark:hover:border-slate-700/80 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-video bg-slate-950 overflow-hidden">
                    <img
                      src={
                        video.thumbnail ||
                        "https://placehold.co/600x400/0f172a/64748b?text=Video"
                      }
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button
                        onClick={() => onSelectVideo && onSelectVideo(video.id)}
                        className="p-3 bg-indigo-600 text-white rounded-full shadow-lg transform group-hover:scale-105 transition-all"
                      >
                        <Play size={18} className="fill-current" />
                      </button>
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <h3
                      onClick={() => onSelectVideo && onSelectVideo(video.id)}
                      className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors"
                    >
                      {video.title || video.filename}
                    </h3>
                  </div>
                </div>

                <div className="px-4 py-3 bg-slate-50 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs">
                  <button
                    onClick={() => onSelectVideo && onSelectVideo(video.id)}
                    className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <Film size={12} /> Open Analytics
                  </button>
                  <button
                    onClick={() => handleRemoveItem(video.id)}
                    className="text-slate-400 hover:text-rose-500 p-1 rounded-lg transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center space-y-3">
          <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-2xl">
            <AlertCircle size={24} />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            No Watch History Found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
            Videos you upload and analyze will show up here in your history.
          </p>
        </div>
      )}
    </div>
  );
}
