"use client";

import { useEffect, useState } from "react";

type Booking = {
  id: string;
  reservation_id: string;
  pavilion_id: string;
  pavilion_name: string;
  date: string;
  start_time: string;
  end_time: string;
  duration_hours: number;
  guest_name: string;
  status: "confirmed" | "cancelled" | "refunded";
};

// One color per pavilion (1-5)
const PAVILION_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  "pavilion-1": { bg: "bg-teal-100", text: "text-teal-800", border: "border-teal-300" },
  "pavilion-2": { bg: "bg-amber-100", text: "text-amber-800", border: "border-amber-300" },
  "pavilion-3": { bg: "bg-orange-100", text: "text-orange-800", border: "border-orange-300" },
  "pavilion-4": { bg: "bg-purple-100", text: "text-purple-800", border: "border-purple-300" },
  "pavilion-5": { bg: "bg-green-100", text: "text-green-800", border: "border-green-300" },
};

function getNext14Days(): string[] {
  const days: string[] = [];
  const today = new Date();
  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
}

function formatDateLabel(dateStr: string): { weekday: string; date: string } {
  const d = new Date(dateStr + "T12:00:00");
  return {
    weekday: d.toLocaleDateString("en-US", { weekday: "short" }),
    date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  };
}

function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
}

export default function AdminSchedulePage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const days = getNext14Days();

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch confirmed bookings only for the schedule view
        const res = await fetch("/api/admin/bookings?status=confirmed");
        if (!res.ok) throw new Error("Failed to load schedule.");
        const data = await res.json();
        setBookings(data.bookings ?? []);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  // Group bookings by date
  const byDate = new Map<string, Booking[]>();
  for (const b of bookings) {
    const existing = byDate.get(b.date) ?? [];
    byDate.set(b.date, [...existing, b]);
  }

  // Count bookings in next 14 days
  const upcomingCount = days.reduce(
    (sum, d) => sum + (byDate.get(d)?.length ?? 0),
    0
  );

  return (
    <div>
      {/* Page header */}
      <div className="mb-6">
        <p className="text-teal-600 text-xs uppercase tracking-widest font-bold mb-1">
          Management
        </p>
        <h1 className="text-3xl font-black text-stone-800">Schedule</h1>
        <p className="text-stone-500 text-sm mt-1">
          Confirmed bookings — next 14 days
        </p>
      </div>

      {/* Legend */}
      <div className="bg-white border-2 border-amber-100 rounded-2xl p-4 mb-6 flex flex-wrap gap-3">
        {Object.entries(PAVILION_COLORS).map(([id, colors]) => (
          <span
            key={id}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${colors.bg} ${colors.text} ${colors.border}`}
          >
            <span className="w-2 h-2 rounded-full bg-current opacity-70" />
            {id
              .replace("pavilion-", "Pavilion ")}
          </span>
        ))}
        <span className="ml-auto text-xs text-stone-400 font-semibold self-center">
          {upcomingCount} upcoming booking{upcomingCount !== 1 ? "s" : ""}
        </span>
      </div>

      {loading ? (
        <div className="bg-white border-2 border-amber-100 rounded-2xl p-10 text-center text-stone-400 font-semibold">
          Loading schedule...
        </div>
      ) : error ? (
        <div className="bg-white border-2 border-amber-100 rounded-2xl p-10 text-center text-red-600 font-semibold">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {days.map((day) => {
            const dayBookings = byDate.get(day) ?? [];
            const label = formatDateLabel(day);
            const isToday = day === days[0];

            return (
              <div
                key={day}
                className={`bg-white border-2 rounded-2xl overflow-hidden ${
                  isToday ? "border-teal-400" : "border-amber-100"
                }`}
              >
                {/* Day header */}
                <div
                  className={`px-5 py-3 flex items-center gap-3 ${
                    isToday ? "bg-teal-700" : "bg-stone-50"
                  }`}
                >
                  <div>
                    <span
                      className={`text-xs font-bold uppercase tracking-widest ${
                        isToday ? "text-teal-200" : "text-stone-400"
                      }`}
                    >
                      {label.weekday}
                    </span>
                    <span
                      className={`ml-2 text-sm font-black ${
                        isToday ? "text-white" : "text-stone-700"
                      }`}
                    >
                      {label.date}
                    </span>
                    {isToday && (
                      <span className="ml-2 text-xs bg-teal-500 text-white px-2 py-0.5 rounded-full font-bold">
                        Today
                      </span>
                    )}
                  </div>
                  <div className="ml-auto">
                    {dayBookings.length === 0 ? (
                      <span
                        className={`text-xs font-semibold ${
                          isToday ? "text-teal-300" : "text-stone-300"
                        }`}
                      >
                        No bookings
                      </span>
                    ) : (
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          isToday
                            ? "bg-teal-500 text-white"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {dayBookings.length} booking{dayBookings.length !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                </div>

                {/* Booking chips */}
                {dayBookings.length > 0 && (
                  <div className="px-5 py-3 flex flex-wrap gap-2">
                    {dayBookings
                      .sort((a, b) => a.start_time.localeCompare(b.start_time))
                      .map((booking) => {
                        const colors =
                          PAVILION_COLORS[booking.pavilion_id] ??
                          PAVILION_COLORS["pavilion-1"];
                        return (
                          <div
                            key={booking.id}
                            className={`flex flex-col px-3 py-2 rounded-xl border text-xs font-semibold ${colors.bg} ${colors.text} ${colors.border}`}
                          >
                            <span className="font-black text-sm">
                              {booking.pavilion_name}
                            </span>
                            <span className="opacity-80">
                              {formatTime(booking.start_time)} &ndash; {formatTime(booking.end_time)}
                            </span>
                            <span className="opacity-70 mt-0.5 truncate max-w-[160px]">
                              {booking.guest_name}
                            </span>
                            <span className="font-mono opacity-60 text-[10px]">
                              {booking.reservation_id}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
