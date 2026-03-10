"use client";

import { useState } from "react";
import { Pavilion } from "@/data/pavilions";

interface ReservationModalProps {
  pavilion: Pavilion;
  onClose: () => void;
}

const DURATIONS = [1, 2, 3, 4, 6, 8];

function toDateInputMin() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

function toDateInputMax() {
  const d = new Date();
  d.setMonth(d.getMonth() + 6);
  return d.toISOString().split("T")[0];
}

export default function ReservationModal({ pavilion, onClose }: ReservationModalProps) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00");
  const [duration, setDuration] = useState(2);
  const [submitted, setSubmitted] = useState(false);

  const total = pavilion.pricePerHour * duration;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log("Reservation request:", { pavilion: pavilion.id, date, time, duration });
    setSubmitted(true);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border-2 border-amber-100">
        {/* Header */}
        <div className="bg-teal-700 rounded-t-2xl px-6 py-4 flex items-start justify-between">
          <div>
            <p className="text-amber-300 text-xs uppercase tracking-widest font-bold mb-0.5">Reserve</p>
            <h2 className="text-lg font-black text-white">{pavilion.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-teal-200 hover:text-white text-2xl leading-none ml-4 mt-0.5 transition-colors"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="px-6 py-5">
          {submitted ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">🤠</div>
              <h3 className="text-xl font-black text-stone-800 mb-2">Yeehaw! Request Received!</h3>
              <p className="text-stone-500 text-sm mb-1">
                <strong className="text-stone-800">{pavilion.name}</strong>
              </p>
              <p className="text-stone-500 text-sm mb-1">
                {date} at {time} · {duration} hr{duration !== 1 ? "s" : ""}
              </p>
              <p className="text-teal-700 font-black text-2xl mt-3">${total} estimated</p>
              <p className="text-stone-400 text-xs mt-2">Payment and confirmation handled at checkout (coming soon).</p>
              <button
                onClick={onClose}
                className="mt-6 bg-teal-700 hover:bg-teal-600 text-white font-black py-2 px-6 rounded-xl transition-colors uppercase text-sm tracking-wider"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              <p className="text-stone-600 text-sm mb-1 leading-relaxed">{pavilion.description}</p>
              <div className="flex gap-4 mt-2 mb-3">
                <p className="text-stone-400 text-xs">Up to {pavilion.capacity} guests</p>
                <p className="text-teal-700 text-xs font-bold">${pavilion.pricePerHour}/hr</p>
              </div>

              <div className="flex flex-wrap gap-1 mb-4">
                {pavilion.features.map((f) => (
                  <span key={f} className="bg-amber-50 border border-amber-200 text-stone-600 text-xs px-2 py-0.5 rounded-full">
                    {f}
                  </span>
                ))}
              </div>

              <hr className="border-amber-100 mb-4" />

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    min={toDateInputMin()}
                    max={toDateInputMax()}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full border-2 border-amber-100 rounded-xl px-3 py-2 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={time}
                    min="09:00"
                    max="21:00"
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full border-2 border-amber-100 rounded-xl px-3 py-2 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Duration</label>
                  <div className="flex flex-wrap gap-2">
                    {DURATIONS.map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDuration(d)}
                        className={`px-3 py-1.5 rounded-xl text-sm font-bold border-2 transition-colors ${
                          duration === d
                            ? "bg-teal-700 text-white border-teal-700"
                            : "bg-white text-stone-600 border-amber-100 hover:border-teal-300"
                        }`}
                      >
                        {d}h
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-amber-50 border-2 border-amber-100 rounded-xl px-4 py-3">
                  <p className="text-stone-500 text-xs">{duration} hr{duration !== 1 ? "s" : ""} × ${pavilion.pricePerHour}/hr</p>
                  <p className="text-teal-700 font-black text-2xl mt-0.5">${total} <span className="text-stone-400 text-sm font-normal">estimated</span></p>
                  <p className="text-stone-400 text-xs mt-1">Final payment at checkout</p>
                </div>

                <button
                  type="submit"
                  className="w-full bg-teal-700 hover:bg-teal-600 text-white font-black py-3 rounded-xl transition-colors uppercase tracking-wider"
                >
                  Reserve {pavilion.name}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
