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
        <p className="text-teal-600 text-xs uppercase tracking-widest font-bold mb-1">Reserve Your Spot</p>
        <h2 className="text-3xl font-black text-stone-800">Pavilion Reservations</h2>
        <p className="text-stone-500 text-sm mt-2">
          Click any pavilion on the map to check availability and book your event.
        </p>
      </div>

      <div className="relative w-full rounded-2xl overflow-hidden border-2 border-amber-100 shadow-lg bg-white">
        <svg
          viewBox="0 0 800 480"
          className="w-full"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Park map with clickable pavilions"
        >
          <rect width="800" height="480" fill="#f0fdf4" />
          <path d="M0 400 Q150 385 300 400 Q450 415 600 395 Q700 385 800 395 L800 480 L0 480 Z" fill="#bfdbfe" opacity="0.5" />
          <path d="M0 240 Q200 230 400 240 Q600 250 800 240" stroke="#dcfce7" strokeWidth="24" fill="none" />
          <path d="M400 0 Q405 200 400 480" stroke="#dcfce7" strokeWidth="18" fill="none" />

          {[
            [60, 70], [90, 140], [140, 50], [710, 80], [730, 160], [670, 110],
            [560, 300], [590, 380], [210, 330], [240, 415], [30, 300], [760, 320],
          ].map(([cx, cy], i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r="22" fill="#166534" opacity="0.35" />
              <circle cx={cx} cy={cy - 8} r="14" fill="#15803d" opacity="0.3" />
            </g>
          ))}

          <ellipse cx="400" cy="430" rx="90" ry="32" fill="#fef9c3" opacity="0.9" />
          <text x="400" y="434" textAnchor="middle" fontSize="9" fill="#92400e" fontWeight="bold">★ AMPHITHEATER</text>
          <rect x="360" y="0" width="80" height="20" fill="#e2e8f0" rx="4" />
          <text x="400" y="14" textAnchor="middle" fontSize="9" fill="#0f766e" fontWeight="bold">ENTRANCE</text>
          <text x="400" y="36" textAnchor="middle" fontSize="11" fill="#0f766e" fontWeight="bold" letterSpacing="2">THE PLAYGROUND @NIEDERWALD</text>

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
                {(isHovered || isSelected) && (
                  <circle cx={cx} cy={cy} r="30" fill="#0f766e" opacity="0.15" />
                )}
                <circle cx={cx} cy={cy + 3} r="18" fill="black" opacity="0.1" />
                <circle
                  cx={cx} cy={cy}
                  r={isHovered || isSelected ? 22 : 17}
                  fill={isSelected ? "#0f766e" : isHovered ? "#0d9488" : "#0f766e"}
                  stroke="white"
                  strokeWidth="2.5"
                  style={{ transition: "r 0.15s" }}
                />
                <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle" fontSize="7" fontWeight="bold" fill="white">
                  {label}
                </text>

                {isHovered && (
                  <g>
                    <rect x={cx - 70} y={cy - 52} width="140" height="30" rx="6" fill="white" />
                    <rect x={cx - 70} y={cy - 52} width="140" height="30" rx="6" fill="none" stroke="#0f766e" strokeWidth="1.5" />
                    <text x={cx} y={cy - 41} textAnchor="middle" dominantBaseline="middle" fontSize="9" fill="#1c1917" fontWeight="bold">
                      {p.name.split("—")[0].trim()} · {p.capacity} guests
                    </text>
                    <text x={cx} y={cy - 29} textAnchor="middle" dominantBaseline="middle" fontSize="8" fill="#0f766e">
                      ${p.pricePerHour}/hr — Click to reserve
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {pavilions.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelected(p)}
            className="flex items-center gap-1.5 text-xs bg-white border-2 border-amber-100 hover:border-teal-400 hover:text-teal-700 text-stone-600 px-3 py-1.5 rounded-full transition-colors font-semibold"
          >
            <span className="w-2 h-2 rounded-full bg-teal-600 inline-block" />
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
