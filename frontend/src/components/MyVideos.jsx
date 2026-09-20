import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Film, Plus, Trash2 } from "lucide-react";
import { apiClient } from "../api/client";

const STATUS_STYLES = {
  processed: "bg-emerald-100 text-emerald-700",
  processing: "bg-amber-100 text-amber-700",
  failed: "bg-red-100 text-red-700",
  uploaded: "bg-blue-100 text-blue-700",
};

function formatDate(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function MyVideos() {
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  function fetchVideos() {
    setError("");
    setLoading(true);
    apiClient
      .get("/videos/me")
      .then((res) => setVideos(res.data.videos || []))
      .catch((err) =>
        setError(err.response?.data?.detail || "Couldn't load your videos."),
      )
      .finally(() => setLoading(false));
  }

  useEffect(fetchVideos, []);

  // ASSUMPTION: DELETE /videos/:id exists, matching the GET /videos/:id and
  // GET /videos/:id/media pattern already confirmed in UploadHistory.jsx.
  // Confirm with your teammate — if the real path differs, only this
  // function needs to change.
  async function handleDelete(video) {
    if (!window.confirm(`Delete "${video.filename}"? This can't be undone.`))
      return;
    setDeletingId(video.id);
    try {
      await apiClient.delete(`/videos/${video.id}`);
      setVideos((prev) => prev.filter((v) => v.id !== video.id));
    } catch (err) {
      alert(err.response?.data?.detail || "Couldn't delete this video.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Videos</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage video intelligence pipelines, transcripts, and public status
          </p>
        </div>
        <button
          onClick={() => navigate("/upload")}
          className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-blue-500/20 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all"
        >
          <Plus size={16} />
          Upload New Video
        </button>
      </div>

      {loading && <p className="text-sm text-gray-500">Loading your videos…</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}

      {!loading && !error && videos.length === 0 && (
        <div className="border border-dashed border-gray-300 rounded-2xl py-16 text-center">
          <Film size={28} className="text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">
            No videos yet — upload your first one to get started.
          </p>
        </div>
      )}

      {!loading && !error && videos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {videos.map((video) => (
            <div
              key={video.id}
              className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            >
              {/* Thumbnail placeholder — no thumbnail/duration field exists
                  on the Video model yet, so this is an icon block, not a
                  real frame. Ask your teammate whether thumbnail
                  generation is planned; I can wire this up the moment a
                  thumbnail_url field exists. */}
              <div className="h-36 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
                <Film size={28} className="text-gray-400" />
                <span
                  className={`absolute top-2.5 left-2.5 text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                    STATUS_STYLES[video.status] || "bg-gray-100 text-gray-600"
                  }`}
                >
                  {video.status}
                </span>
              </div>

              <div className="p-4">
                <p className="text-sm font-bold text-gray-900 truncate">
                  {video.filename}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Uploaded {formatDate(video.uploaded_at)}
                </p>

                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() => navigate(`/videos/${video.id}`)}
                    className="flex-1 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg py-2 transition-colors duration-150"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleDelete(video)}
                    disabled={deletingId === video.id}
                    className="flex items-center justify-center w-9 h-9 text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors duration-150 disabled:opacity-50"
                    aria-label={`Delete ${video.filename}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
