"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { pavilions, Pavilion } from "@/data/pavilions";
import ReservationModal from "./ReservationModal";

type ApiPavilion = {
  id: string;
  name: string;
  description: string;
  features: string[];
  firstHourPrice: number;
  additionalHourPrice: number;
  isActive: boolean;
  capacity: number;
  mapX: number | null;
  mapY: number | null;
};

const landmarks = [
  { label: "🔥 Fire Pit",         x: 48, y: 24 },
  { label: "🚂 Train Station",    x: 79, y: 13 },
  { label: "🎪 Stage",            x: 17, y: 30 },
  { label: "🍺 Bar",              x: 14, y: 60 },
  { label: "🎠 Playground",       x: 38, y: 65 },
  { label: "🦘 Jumping Pad",      x: 74, y: 56 },
  { label: "💎 Gem Mining",       x: 73, y: 70 },
  { label: "🚪 Entrance",         x: 43, y: 92 },
];

export default function PavilionMap() {
  const [selected, setSelected] = useState<Pavilion | null>(null);
  const [hovered,  setHovered]  = useState<string | null>(null);
  const [activeIds, setActiveIds] = useState<Set<string>>(
    new Set(pavilions.map((p) => p.id)) // optimistic: all active until API says otherwise
  );
  // Overrides fetched from the API (name, description, features, map position)
  const [apiData, setApiData] = useState<Map<string, ApiPavilion>>(new Map());

  useEffect(() => {
    fetch("/api/pavilions")
      .then((r) => r.json())
      .then((list: ApiPavilion[]) => {
        setActiveIds(new Set(list.filter((p) => p.isActive).map((p) => p.id)));
        setApiData(new Map(list.map((p) => [p.id, p])));
      })
      .catch(() => {/* keep optimistic default */});
  }, []);

  // Merge static pavilion data with API overrides for display
  function getMergedPavilion(p: Pavilion): Pavilion & { effectiveX: number; effectiveY: number } {
    const api = apiData.get(p.id);
    return {
      ...p,
      name:                api?.name        ?? p.name,
      description:         api?.description ?? p.description,
      features:            api?.features    ?? p.features,
      firstHourPrice:      api?.firstHourPrice      ?? p.firstHourPrice,
      additionalHourPrice: api?.additionalHourPrice  ?? p.additionalHourPrice,
      capacity:            api?.capacity    ?? p.capacity,
      effectiveX:          api?.mapX        ?? p.x,
      effectiveY:          api?.mapY        ?? p.y,
    };
  }

  function handleSelect(p: Pavilion) {
    if (!activeIds.has(p.id)) return;
    const merged = getMergedPavilion(p);
    setSelected(merged);
  }

  return (
    <div id="pavilions" className="scroll-mt-20">
      {/* Pavilion photo */}
      <div className="relative w-full h-56 sm:h-72 rounded-2xl overflow-hidden mb-6 shadow-md">
        <Image
          src="/images/pavilion-photo.jpg"
          alt="The Playground @niederwald — shaded pavilions on the property"
          fill
          className="object-cover object-center"
          sizes="(max-width: 768px) 100vw, 1200px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-stone-950/20 to-transparent" />
        <div className="absolute bottom-5 left-6">
          <p className="text-amber-400 text-xs uppercase tracking-widest font-bold mb-1">Reserve Your Spot</p>
          <h2 className="text-3xl font-black text-white drop-shadow-lg">Pavilion Reservations</h2>
          <p className="text-stone-200 text-sm mt-1">
            Click any numbered pavilion on the map to see details and book your spot.
          </p>
        </div>
      </div>

      {/* Map */}
      <div
        className="relative w-full rounded-2xl overflow-hidden border-2 border-amber-100 shadow-lg select-none"
        style={{ aspectRatio: "1024 / 1536" }}
      >
        <Image
          src="/images/park-map.png"
          alt="Playground Niederwald park map"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 800px"
          priority
        />

        {/* Landmark labels */}
        {landmarks.map((lm) => (
          <div
            key={lm.label}
            className="absolute pointer-events-none"
            style={{ left: `${lm.x}%`, top: `${lm.y}%`, transform: "translate(-50%, -50%)" }}
          >
            <span className="bg-white/80 backdrop-blur-sm text-stone-700 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm border border-white/60 whitespace-nowrap">
              {lm.label}
            </span>
          </div>
        ))}

        {/* Pavilion markers */}
        {pavilions.map((p) => {
          const merged     = getMergedPavilion(p);
          const isActive   = activeIds.has(p.id);
          const isHovered  = hovered === p.id;
          const isSelected = selected?.id === p.id;

          return (
            <button
              key={p.id}
              onClick={() => handleSelect(p)}
              onMouseEnter={() => setHovered(p.id)}
              onMouseLeave={() => setHovered(null)}
              aria-label={isActive ? `Reserve ${merged.name}` : `${merged.name} — unavailable`}
              disabled={!isActive}
              className="absolute focus:outline-none group disabled:cursor-not-allowed"
              style={{ left: `${merged.effectiveX}%`, top: `${merged.effectiveY}%`, transform: "translate(-50%, -50%)" }}
            >
              {(isHovered || isSelected) && isActive && (
                <span className="absolute inset-0 -m-2 rounded-full bg-teal-400/30 animate-ping" />
              )}

              <span
                className={`relative flex items-center justify-center rounded-full font-black text-sm shadow-lg border-2 transition-all duration-150 ${
                  !isActive
                    ? "bg-stone-200 text-stone-400 border-stone-300 w-8 h-8 opacity-70"
                    : isSelected
                    ? "bg-teal-700 text-white border-white w-9 h-9 shadow-teal-400/40"
                    : isHovered
                    ? "bg-teal-600 text-white border-white w-9 h-9 shadow-teal-400/30"
                    : "bg-white text-teal-700 border-teal-500 w-8 h-8"
                }`}
              >
                {p.number}
              </span>

              {isHovered && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-10 pointer-events-none">
                  <div className="bg-stone-900 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-xl whitespace-nowrap text-center">
                    <p>{merged.name}</p>
                    {isActive ? (
                      <>
                        <p className="text-amber-400 font-black">${merged.firstHourPrice} first hr · ${merged.additionalHourPrice}/hr after · up to {merged.capacity} guests</p>
                        <p className="text-stone-400 text-[10px] mt-0.5">Click to reserve</p>
                      </>
                    ) : (
                      <p className="text-stone-400 text-[10px] mt-0.5">Currently unavailable</p>
                    )}
                  </div>
                  <div className="w-2 h-2 bg-stone-900 rotate-45 mx-auto -mt-1" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-2">
        {pavilions.map((p) => {
          const merged = getMergedPavilion(p);
          const isActive = activeIds.has(p.id);
          return (
            <button
              key={p.id}
              onClick={() => handleSelect(p)}
              disabled={!isActive}
              className={`flex items-center gap-2 border-2 px-3 py-2 rounded-xl transition-all text-xs font-bold ${
                isActive
                  ? "bg-white border-amber-100 hover:border-teal-400 hover:bg-teal-50 text-stone-700 hover:text-teal-700"
                  : "bg-stone-50 border-stone-200 text-stone-400 cursor-not-allowed opacity-70"
              }`}
            >
              <span className={`w-6 h-6 rounded-full flex items-center justify-center font-black flex-shrink-0 text-xs ${
                isActive ? "bg-teal-700 text-white" : "bg-stone-300 text-stone-500"
              }`}>
                {p.number}
              </span>
              <span className="text-left leading-tight">
                {merged.name}<br />
                {isActive
                  ? <span className="text-stone-400 font-normal">From ${merged.firstHourPrice}/hr</span>
                  : <span className="text-stone-400 font-normal italic">Unavailable</span>
                }
              </span>
            </button>
          );
        })}
      </div>

      {selected && (
        <ReservationModal pavilion={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
