"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const OPENING = new Date("2026-05-16T09:00:00");

function getTimeLeft() {
  const diff = OPENING.getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days:    Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours:   Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export default function OpeningCountdown() {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft);

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!timeLeft) return null;

  const units = [
    { label: "Days",    value: timeLeft.days    },
    { label: "Hours",   value: timeLeft.hours   },
    { label: "Minutes", value: timeLeft.minutes },
    { label: "Seconds", value: timeLeft.seconds },
  ];

  return (
    <section className="bg-stone-900 py-10 px-6 text-center">
      <p className="text-amber-400 text-xs uppercase tracking-widest font-bold mb-2">
        ★ &nbsp; Grand Opening &nbsp; ★
      </p>
      <h2 className="text-white text-2xl font-black mb-6">
        The Playground opens May 16th — don&apos;t miss it!
      </h2>

      <div className="flex justify-center gap-4 sm:gap-8 mb-8">
        {units.map(({ label, value }) => (
          <div key={label} className="flex flex-col items-center">
            <span className="text-4xl sm:text-6xl font-black text-amber-400 tabular-nums leading-none">
              {String(value).padStart(2, "0")}
            </span>
            <span className="text-stone-400 text-[10px] uppercase tracking-widest mt-1 font-bold">
              {label}
            </span>
          </div>
        ))}
      </div>

      <Link
        href="/playground#pavilions"
        className="inline-block bg-amber-400 hover:bg-amber-300 text-stone-900 font-black py-3 px-10 rounded-2xl text-sm uppercase tracking-widest transition-colors shadow-lg shadow-amber-400/20"
      >
        Book a Pavilion Now →
      </Link>
    </section>
  );
}
