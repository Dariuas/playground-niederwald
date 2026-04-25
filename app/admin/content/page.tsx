"use client";

import { useEffect, useState } from "react";

export default function AdminContentPage() {
  const [announcement, setAnnouncement] = useState("");
  const [savedText, setSavedText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedState, setSavedState] = useState<"idle" | "saved" | "cleared">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/admin/site-config");
        if (!res.ok) throw new Error("Failed to load site config.");
        const data = await res.json();
        const text = data.announcement ?? "";
        setAnnouncement(text);
        setSavedText(text);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleChange = (val: string) => {
    setAnnouncement(val);
    setSavedState("idle");
  };

  const save = async (text: string) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/site-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "announcement", value: text || null }),
      });
      if (!res.ok) throw new Error("Save failed.");
      setSavedText(text);
      setSavedState(text ? "saved" : "cleared");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleSave = () => save(announcement);
  const handleClear = () => {
    setAnnouncement("");
    save("");
  };

  const hasChanges = announcement !== savedText;

  return (
    <div>
      {/* Page header */}
      <div className="mb-6">
        <p className="text-teal-600 text-xs uppercase tracking-widest font-bold mb-1">
          Management
        </p>
        <h1 className="text-3xl font-black text-stone-800">Site Content</h1>
        <p className="text-stone-500 text-sm mt-1">
          Manage sitewide announcements and other dynamic content.
        </p>
      </div>

      {loading ? (
        <div className="bg-white border-2 border-amber-100 rounded-2xl p-10 text-center text-stone-400 font-semibold">
          Loading content settings...
        </div>
      ) : error ? (
        <div className="bg-white border-2 border-amber-100 rounded-2xl p-10 text-center text-red-600 font-semibold">
          {error}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Announcement card */}
          <div className="bg-white border-2 border-amber-100 rounded-2xl overflow-hidden">
            {/* Card header */}
            <div className="px-6 py-4 bg-stone-50 border-b border-amber-100 flex items-center justify-between">
              <div>
                <p className="font-black text-stone-800">Announcement Banner</p>
                <p className="text-xs text-stone-400 mt-0.5">
                  Displayed in an amber banner below the navbar on every public page. Leave empty to hide.
                </p>
              </div>
              {savedText && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex-shrink-0">
                  Active
                </span>
              )}
            </div>

            {/* Card body */}
            <div className="p-6">
              {/* Preview */}
              {announcement && (
                <div className="mb-4">
                  <p className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                    Preview
                  </p>
                  <div className="bg-amber-400 rounded-xl px-4 py-2.5 flex items-center justify-between gap-4">
                    <p className="text-sm font-semibold text-stone-900 flex-1 text-center">
                      {announcement}
                    </p>
                    <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-amber-500/60 font-black text-stone-700 text-lg leading-none">
                      ×
                    </span>
                  </div>
                </div>
              )}

              {/* Textarea */}
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                  Announcement Text
                </label>
                <textarea
                  rows={3}
                  value={announcement}
                  onChange={(e) => handleChange(e.target.value)}
                  placeholder="e.g. We're open this weekend! Join us Sat & Sun 10am–6pm."
                  className="w-full px-3 py-2 border-2 border-stone-200 rounded-xl text-sm text-stone-700 focus:outline-none focus:border-teal-500 transition-colors resize-none"
                />
                <p className="text-xs text-stone-400 mt-1">
                  Keep it brief — one or two sentences. The banner is dismissible by visitors.
                </p>
              </div>
            </div>

            {/* Card footer */}
            <div className="px-6 py-4 bg-stone-50 border-t border-amber-100 flex items-center justify-between">
              <div>
                {savedState === "saved" && (
                  <p className="text-sm font-semibold text-green-700">
                    Announcement saved and now live.
                  </p>
                )}
                {savedState === "cleared" && (
                  <p className="text-sm font-semibold text-stone-500">
                    Announcement cleared — banner is hidden.
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3">
                {savedText && (
                  <button
                    onClick={handleClear}
                    disabled={saving}
                    className="px-4 py-2 rounded-xl text-sm font-bold text-stone-500 hover:text-red-600 hover:bg-red-50 transition-all disabled:opacity-50"
                  >
                    Clear Banner
                  </button>
                )}
                <button
                  onClick={handleSave}
                  disabled={saving || !hasChanges}
                  className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                    savedState === "saved" && !hasChanges
                      ? "bg-green-100 text-green-700"
                      : "bg-teal-700 text-white hover:bg-teal-600"
                  } disabled:opacity-50`}
                >
                  {saving
                    ? "Saving..."
                    : savedState === "saved" && !hasChanges
                    ? "Saved!"
                    : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
