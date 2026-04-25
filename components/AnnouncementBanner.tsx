"use client";

import { useState } from "react";

export default function AnnouncementBanner({ text }: { text: string }) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-amber-400 text-stone-900">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
        <p className="text-sm font-semibold flex-1 text-center leading-snug">{text}</p>
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss announcement"
          className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full hover:bg-amber-500 transition-colors font-black text-stone-700 text-lg leading-none"
        >
          ×
        </button>
      </div>
    </div>
  );
}
