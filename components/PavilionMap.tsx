"use client";

import { useState } from "react";
import Image from "next/image";
import { pavilions, Pavilion } from "@/data/pavilions";
import ReservationModal from "./ReservationModal";

// Non-clickable landmark labels overlaid on the map
const landmarks = [
  { label: "🔥 Fire Pit",         x: 42, y: 24 },
  { label: "🚂 Train Station",    x: 70, y: 20 },
  { label: "🎮 Games Pavilion",   x: 77, y: 41 },
  { label: "💎 Gem Mining",       x: 75, y: 63 },
  { label: "🍺 Bar",              x: 15, y: 50 },
  { label: "🎠 Playground",       x: 44, y: 54 },
  { label: "🚪 Entrance",         x: 42, y: 83 },
];

export default function PavilionMap() {
  const [selected, setSelected] = useState<Pavilion | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div id="pavilions" className="scroll-mt-20">
      <div className="mb-6">
        <p className="text-teal-600 text-xs uppercase tracking-widest font-bold mb-1">Pick Your Spot</p>
        <h2 className="text-3xl font-black text-stone-800">Pavilion Reservations</h2>
        <p className="text-stone-500 text-sm mt-1 max-w-xl">
          Click any numbered pavilion on the map below to see details and reserve your spot.
        </p>
      </div>

      {/* Map container — aspect-ratio locks height to the image proportions on all screen sizes */}
      <div
        className="relative w-full rounded-2xl overflow-hidden border-2 border-amber-100 shadow-lg select-none"
        style={{ aspectRatio: "1270 / 952" }}
      >
        {/* Background map image */}
        <Image
          src="/images/park-map.png"
          alt="The Playground @niederwald park map"
          fill
          className="object-cover"
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

        {/* Pavilion clickable markers */}
        {pavilions.map((p) => {
          const isHovered = hovered === p.id;
          const isSelected = selected?.id === p.id;

          return (
            <button
              key={p.id}
              onClick={() => setSelected(p)}
              onMouseEnter={() => setHovered(p.id)}
              onMouseLeave={() => setHovered(null)}
              aria-label={`Reserve ${p.name}`}
              className="absolute focus:outline-none group"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              {/* Pulse ring on hover */}
              {(isHovered || isSelected) && (
                <span className="absolute inset-0 -m-2 rounded-full bg-teal-400/30 animate-ping" />
              )}

              {/* Marker circle */}
              <span
                className={`relative flex items-center justify-center rounded-full font-black text-sm shadow-lg border-2 transition-all duration-150 ${
                  isSelected
                    ? "bg-teal-700 text-white border-white w-9 h-9 shadow-teal-400/40"
                    : isHovered
                    ? "bg-teal-600 text-white border-white w-9 h-9 shadow-teal-400/30"
                    : "bg-white text-teal-700 border-teal-500 w-8 h-8"
                }`}
              >
                {p.number}
              </span>

              {/* Tooltip */}
              {isHovered && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-10 pointer-events-none">
                  <div className="bg-stone-900 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-xl whitespace-nowrap text-center">
                    <p>{p.name}</p>
                    <p className="text-amber-400 font-black">${p.pricePerHour}/hr · up to {p.capacity} guests</p>
                    <p className="text-stone-400 text-[10px] mt-0.5">Click to reserve</p>
                  </div>
                  {/* Arrow */}
                  <div className="w-2 h-2 bg-stone-900 rotate-45 mx-auto -mt-1" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-2">
        {pavilions.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelected(p)}
            className="flex items-center gap-2 bg-white border-2 border-amber-100 hover:border-teal-400 hover:bg-teal-50 text-stone-700 hover:text-teal-700 px-3 py-2 rounded-xl transition-all text-xs font-bold"
          >
            <span className="w-6 h-6 rounded-full bg-teal-700 text-white flex items-center justify-center font-black flex-shrink-0 text-xs">
              {p.number}
            </span>
            <span className="text-left leading-tight">
              Pavilion {p.number}<br />
              <span className="text-stone-400 font-normal">${p.pricePerHour}/hr</span>
            </span>
          </button>
        ))}
      </div>

      {/* Modal */}
      {selected && (
        <ReservationModal pavilion={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
