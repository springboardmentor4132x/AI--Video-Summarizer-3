import React, { useState } from "react";
import {
  User,
  Mail,
  Shield,
  Camera,
  Save,
  CheckCircle,
  Video,
  Film,
  Sparkles,
} from "lucide-react";

export default function Profile({ user, onUpdateUser }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "Pragati Shaw",
    email: user?.email || "pragati@example.com",
    role: user?.role || "Learner",
  });
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    if (onUpdateUser) {
      onUpdateUser(formData);
    }
    setIsEditing(false);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-6 md:p-10 max-w-5xl mx-auto space-y-6 transition-colors duration-200">
      {/* Page Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            User Profile
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage your personal details and view account role privileges.
          </p>
        </div>
        {savedNotice && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 px-3 py-1.5 rounded-xl transition-all">
            <CheckCircle size={14} /> Profile updated successfully
          </div>
        )}
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 md:p-8 backdrop-blur-md shadow-sm dark:shadow-none space-y-8">
        {/* Avatar Header Block */}
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-600 to-emerald-500 text-white font-black text-3xl flex items-center justify-center shadow-lg">
              {formData.name?.[0]?.toUpperCase() || "U"}
            </div>
            <button className="absolute bottom-0 right-0 p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-md transition-all">
              <Camera size={14} />
            </button>
          </div>

          <div className="text-center sm:text-left space-y-1">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {formData.name}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {formData.email}
            </p>
            <span className="inline-block mt-2 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800/60 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              {formData.role}
            </span>
          </div>
        </div>

        {/* Profile Information Form */}
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 disabled:opacity-75 transition-all"
                />
                <User
                  size={16}
                  className="absolute left-3.5 top-3 text-slate-400 dark:text-slate-500"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  disabled={!isEditing}
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 disabled:opacity-75 transition-all"
                />
                <Mail
                  size={16}
                  className="absolute left-3.5 top-3 text-slate-400 dark:text-slate-500"
                />
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                Account Role
              </label>
              <div className="relative">
                <input
                  type="text"
                  disabled
                  value={formData.role}
                  className="w-full bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-500 dark:text-slate-400 cursor-not-allowed"
                />
                <Shield
                  size={16}
                  className="absolute left-3.5 top-3 text-slate-400 dark:text-slate-500"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition"
                >
                  <Save size={14} /> Save Changes
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:opacity-90 transition"
              >
                Edit Profile
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Account Activity Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <Video size={18} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              ClipMind AI
            </p>
            <p className="text-[11px] text-slate-500">Learner Tier Activated</p>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Film size={18} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              Unlimited
            </p>
            <p className="text-[11px] text-slate-500">
              Whisper Transcript Usage
            </p>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Sparkles size={18} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              Active
            </p>
            <p className="text-[11px] text-slate-500">
              Talk-to-Video Chat Engine
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
