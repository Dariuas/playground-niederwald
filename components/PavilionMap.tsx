"use client";

import { useState } from "react";
import { pavilions, Pavilion } from "@/data/pavilions";
import ReservationModal from "./ReservationModal";

export default function PavilionMap() {
  const [selected, setSelected] = useState<Pavilion | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div id="pavilions" className="scroll-mt-20">
      <div className="mb-6">
        <p className="text-amber-400 text-xs uppercase tracking-widest font-bold mb-1">Reserve Your Spot</p>
        <h2 className="text-3xl font-black text-white">Pavilion Reservations</h2>
        <p className="text-stone-400 text-sm mt-2">
          Click any gazebo on the map to check availability and book your event.
        </p>
      </div>

      {/* Interactive Map */}
      <div className="relative w-full rounded-2xl overflow-hidden border border-stone-700 shadow-xl bg-stone-900">
        <svg
          viewBox="0 0 800 480"
          className="w-full"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Park map with clickable pavilions"
        >
          {/* Background — Texas land */}
          <rect width="800" height="480" fill="#1c1917" />

          {/* Grass areas */}
          <rect x="0" y="0" width="800" height="480" fill="#1a2e1a" opacity="0.6" />

          {/* Paths */}
          <path d="M0 240 Q200 230 400 240 Q600 250 800 240" stroke="#292524" strokeWidth="24" fill="none" />
          <path d="M400 0 Q405 200 400 480" stroke="#292524" strokeWidth="18" fill="none" />

          {/* Water / creek */}
          <path
            d="M0 400 Q150 385 300 400 Q450 415 600 395 Q700 385 800 395 L800 480 L0 480 Z"
            fill="#1e3a5f"
            opacity="0.5"
          />

          {/* Trees */}
          {[
            [60, 70], [90, 140], [140, 50], [710, 80], [730, 160], [670, 110],
            [560, 300], [590, 380], [210, 330], [240, 415], [30, 300], [760, 320],
          ].map(([cx, cy], i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r="22" fill="#14532d" opacity="0.7" />
              <circle cx={cx} cy={cy - 8} r="14" fill="#166534" opacity="0.6" />
            </g>
          ))}

          {/* Amphitheater / stage area */}
          <ellipse cx="400" cy="430" rx="90" ry="32" fill="#451a03" opacity="0.8" />
          <text x="400" y="434" textAnchor="middle" fontSize="9" fill="#fb923c" fontWeight="bold">
            ★ AMPHITHEATER
          </text>

          {/* Entrance */}
          <rect x="360" y="0" width="80" height="20" fill="#292524" rx="4" />
          <text x="400" y="14" textAnchor="middle" fontSize="9" fill="#fbbf24" fontWeight="bold">ENTRANCE</text>

          {/* Map title */}
          <text x="400" y="36" textAnchor="middle" fontSize="11" fill="#fbbf24" fontWeight="bold" letterSpacing="3">
            THE PLAYGROUND @NIEDERWALD
          </text>

          {/* Pavilion pins */}
          {pavilions.map((p) => {
            const cx = (p.x / 100) * 800;
            const cy = (p.y / 100) * 480;
            const isHovered = hovered === p.id;
            const isSelected = selected?.id === p.id;
            const label = p.name.split("—")[0].trim().replace("Pavilion ", "P");

            return (
              <g
                key={p.id}
                className="cursor-pointer"
                onClick={() => setSelected(p)}
                onMouseEnter={() => setHovered(p.id)}
                onMouseLeave={() => setHovered(null)}
                role="button"
                tabIndex={0}
                aria-label={`Reserve ${p.name}`}
                onKeyDown={(e) => e.key === "Enter" && setSelected(p)}
              >
                {/* Glow */}
                {(isHovered || isSelected) && (
                  <circle cx={cx} cy={cy} r="30" fill="#fbbf24" opacity="0.15" />
                )}

                {/* Shadow */}
                <circle cx={cx} cy={cy + 4} r="18" fill="black" opacity="0.3" />

                {/* Pin */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered || isSelected ? 22 : 17}
                  fill={isSelected ? "#f59e0b" : isHovered ? "#fbbf24" : "#d97706"}
                  stroke={isSelected ? "#fde68a" : "white"}
                  strokeWidth="2"
                  style={{ transition: "r 0.15s, fill 0.15s" }}
                />

                {/* Star icon in pin */}
                <text
                  x={cx}
                  y={cy + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="7"
                  fontWeight="bold"
                  fill="#1c1917"
                >
                  {label}
                </text>

                {/* Tooltip */}
                {isHovered && (
                  <g>
                    <rect x={cx - 70} y={cy - 52} width="140" height="30" rx="6" fill="#0c0a09" opacity="0.95" />
                    <rect x={cx - 70} y={cy - 52} width="140" height="30" rx="6" fill="none" stroke="#d97706" strokeWidth="1" />
                    <text x={cx} y={cy - 41} textAnchor="middle" dominantBaseline="middle" fontSize="9" fill="white" fontWeight="bold">
                      {p.name.split("—")[0].trim()} · {p.capacity} guests
                    </text>
                    <text x={cx} y={cy - 29} textAnchor="middle" dominantBaseline="middle" fontSize="8" fill="#fbbf24">
                      ${p.pricePerHour}/hr — Click to reserve
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend buttons */}
      <div className="mt-4 flex flex-wrap gap-2">
        {pavilions.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelected(p)}
            className="flex items-center gap-1.5 text-xs bg-stone-800 border border-stone-700 hover:border-amber-500 hover:text-amber-400 text-stone-300 px-3 py-1.5 rounded-full transition-colors font-semibold uppercase tracking-wider"
          >
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
            {p.name.split("—")[0].trim()}
          </button>
        ))}
      </div>

      {selected && (
        <ReservationModal pavilion={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
