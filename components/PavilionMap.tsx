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

export default function PavilionMap() {
  const [selected, setSelected] = useState<Pavilion | null>(null);
  const [activeIds, setActiveIds] = useState<Set<string>>(
    new Set(pavilions.map((p) => p.id)),
  );
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

  function getMerged(p: Pavilion): Pavilion {
    const api = apiData.get(p.id);
    return {
      ...p,
      name:                api?.name        ?? p.name,
      description:         api?.description ?? p.description,
      features:            api?.features    ?? p.features,
      firstHourPrice:      api?.firstHourPrice      ?? p.firstHourPrice,
      additionalHourPrice: api?.additionalHourPrice ?? p.additionalHourPrice,
      capacity:            api?.capacity    ?? p.capacity,
    };
  }

  function handleSelect(p: Pavilion) {
    if (!activeIds.has(p.id)) return;
    setSelected(getMerged(p));
  }

  return (
    <div id="pavilions" className="scroll-mt-20 space-y-8">
      {/* Hero photo */}
      <div className="relative w-full h-56 sm:h-72 rounded-2xl overflow-hidden shadow-md">
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
            Pick the pavilion that fits your party — see the map below for layout.
          </p>
        </div>
      </div>

      {/* Pavilion cards — the actual booking UI */}
      <div>
        <p className="text-teal-600 text-xs uppercase tracking-widest font-bold mb-1">Choose your pavilion</p>
        <h3 className="text-2xl font-black text-stone-800 mb-4">Available Pavilions</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pavilions.map((p) => {
            const merged   = getMerged(p);
            const isActive = activeIds.has(p.id);
            const isGames  = p.id === "pavilion-6";

            return (
              <div
                key={p.id}
                className={`relative rounded-2xl border-2 p-5 flex flex-col transition-all ${
                  !isActive
                    ? "bg-stone-50 border-stone-200 opacity-70"
                    : isGames
                    ? "bg-gradient-to-br from-amber-50 to-white border-amber-300 shadow-md hover:shadow-lg"
                    : "bg-white border-amber-100 hover:border-teal-300 hover:shadow-md"
                }`}
              >
                {isGames && isActive && (
                  <span className="absolute -top-2 -right-2 bg-amber-400 text-stone-900 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest shadow-sm">
                    ★ Premium
                  </span>
                )}

                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg flex-shrink-0 ${
                    !isActive
                      ? "bg-stone-200 text-stone-400"
                      : isGames
                      ? "bg-amber-400 text-stone-900"
                      : "bg-teal-700 text-white"
                  }`}>
                    {isGames ? "★" : p.number}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base font-black text-stone-800 leading-tight">{merged.name}</h4>
                    <p className="text-stone-400 text-xs font-semibold mt-0.5">
                      Up to {merged.capacity} guests
                    </p>
                  </div>
                </div>

                <p className="text-stone-500 text-sm leading-relaxed mb-3 flex-1">
                  {merged.description}
                </p>

                <div className="flex flex-wrap gap-1 mb-4">
                  {merged.features.map((f) => (
                    <span key={f} className="bg-amber-50 border border-amber-200 text-stone-500 text-[11px] px-2 py-0.5 rounded-full">
                      {f}
                    </span>
                  ))}
                </div>

                <div className="flex items-end justify-between gap-3 pt-3 border-t border-amber-100">
                  <div>
                    {isActive ? (
                      <>
                        <p className="text-teal-700 font-black text-xl leading-none">
                          ${merged.firstHourPrice}
                          <span className="text-stone-400 text-xs font-semibold ml-1">first hr</span>
                        </p>
                        <p className="text-stone-400 text-xs mt-1">
                          + ${merged.additionalHourPrice}/hr after
                        </p>
                      </>
                    ) : (
                      <p className="text-stone-400 text-sm font-semibold italic">Currently unavailable</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSelect(p)}
                    disabled={!isActive}
                    className={`font-black px-4 py-2 rounded-xl transition-colors uppercase text-xs tracking-widest whitespace-nowrap ${
                      !isActive
                        ? "bg-stone-200 text-stone-400 cursor-not-allowed"
                        : isGames
                        ? "bg-amber-500 hover:bg-amber-400 text-stone-900"
                        : "bg-teal-700 hover:bg-teal-600 text-white"
                    }`}
                  >
                    Reserve →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Park map — purely visual reference, no clickable markers */}
      <div>
        <p className="text-teal-600 text-xs uppercase tracking-widest font-bold mb-1">Park layout</p>
        <h3 className="text-2xl font-black text-stone-800 mb-1">Where are the pavilions?</h3>
        <p className="text-stone-500 text-sm mb-4">
          Numbered boxes show pavilion locations on the property.
        </p>
        <div
          className="relative w-full rounded-2xl overflow-hidden border-2 border-amber-100 shadow-lg"
          style={{
            aspectRatio: "1024 / 1536",
            backgroundImage: "url('/images/park-map.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          role="img"
          aria-label="Park map showing the locations of pavilions, playground, train road, and other amenities"
        />
      </div>

      {selected && (
        <ReservationModal pavilion={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
