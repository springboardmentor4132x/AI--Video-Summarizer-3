import React, { useState, useEffect } from "react";
import {
  Play,
  Bookmark,
  Trash2,
  Search,
  Film,
  AlertCircle,
  Loader2,
} from "lucide-react";
import apiClient from "../api/client";

export default function Bookmarks({ onSelectVideo }) {
  const [bookmarkedItems, setBookmarkedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await apiClient.get("/bookmarks", {
          headers: { authorization: `Bearer ${token}` },
        });
        setBookmarkedItems(response.data || []);
      } catch (err) {
        console.error("Failed to fetch bookmarks", err);
        setError("Could not load bookmarked videos right now.");
      } finally {
        setLoading(false);
      }
    };
    fetchBookmarks();
  }, []);

  const handleRemoveBookmark = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await apiClient.delete(`/bookmarks/${id}`, {
        headers: { authorization: `Bearer ${token}` },
      });
      setBookmarkedItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Failed to remove bookmark", err);
    }
  };

  const filteredItems = bookmarkedItems.filter((item) =>
    (item.title || item.filename || "")
      .toLowerCase()
      .includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-6 md:p-10 max-w-6xl mx-auto space-y-6 transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Bookmark className="text-amber-500 fill-amber-500" size={24} />{" "}
            Saved Bookmarks
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Quickly access your pinned videos, key moments, and saved
            transcripts.
          </p>
        </div>
      </div>

      {/* Search Input */}
      {bookmarkedItems.length > 0 && (
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Search saved bookmarks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 shadow-sm dark:shadow-none transition"
          />
          <Search
            size={16}
            className="absolute left-3.5 top-3 text-slate-400 dark:text-slate-500"
          />
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 space-y-3">
          <Loader2 size={24} className="animate-spin text-indigo-500" />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Loading your saved bookmarks...
          </p>
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-2xl text-xs text-rose-600 dark:text-rose-400">
          {error}
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((video) => (
            <div
              key={video.id}
              className="group bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm dark:shadow-none hover:shadow-lg dark:hover:border-slate-700/80 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Thumbnail Container */}
                <div className="relative aspect-video bg-slate-950 overflow-hidden">
                  <img
                    src={
                      video.thumbnail ||
                      "https://placehold.co/600x400/0f172a/64748b?text=Saved+Video"
                    }
                    alt={video.title || video.filename}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      onClick={() => onSelectVideo && onSelectVideo(video.id)}
                      className="p-3 bg-indigo-600 text-white rounded-full shadow-lg transform group-hover:scale-105 transition-all"
                      title="Play / Analyze Video"
                    >
                      <Play size={18} className="fill-current" />
                    </button>
                  </div>

                  {video.duration_seconds && (
                    <span className="absolute bottom-2 right-2 bg-slate-950/80 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-md backdrop-blur-sm">
                      {Math.floor(video.duration_seconds / 60)}m
                    </span>
                  )}
                </div>

                {/* Video Info */}
                <div className="p-4 space-y-2">
                  <h3
                    onClick={() => onSelectVideo && onSelectVideo(video.id)}
                    className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors"
                  >
                    {video.title || video.filename}
                  </h3>
                  {video.notes && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 italic">
                      "{video.notes}"
                    </p>
                  )}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="px-4 py-3 bg-slate-50 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs">
                <button
                  onClick={() => onSelectVideo && onSelectVideo(video.id)}
                  className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <Film size={12} /> Open Workspace
                </button>
                <button
                  onClick={() => handleRemoveBookmark(video.id)}
                  className="text-slate-400 hover:text-rose-500 p-1 rounded-lg transition-colors"
                  title="Remove bookmark"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center space-y-3">
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl">
            <Bookmark size={24} />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            No Bookmarks Saved Yet
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
            {searchQuery
              ? "No saved bookmarks match your search term."
              : "Click the bookmark icon on any video in your library or video detail view to save it here."}
          </p>
        </div>
      )}
    </div>
  );
}
