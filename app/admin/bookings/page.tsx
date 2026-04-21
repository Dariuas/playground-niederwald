"use client";

import { useEffect, useState, useCallback } from "react";

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
  guest_email: string;
  guest_phone: string | null;
  total_cents: number;
  status: "confirmed" | "cancelled" | "refunded";
  square_payment_id: string | null;
  notes: string | null;
  created_at: string;
};

type Summary = {
  total: number;
  confirmed: number;
  cancelled: number;
  refunded: number;
  revenueCents: number;
};

type StatusFilter = "all" | "confirmed" | "cancelled" | "refunded";

const STATUS_TABS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "confirmed", label: "Confirmed" },
  { key: "cancelled", label: "Cancelled" },
  { key: "refunded", label: "Refunded" },
];

function statusBadge(status: Booking["status"]) {
  const classes: Record<Booking["status"], string> = {
    confirmed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-600",
    refunded: "bg-stone-100 text-stone-500",
  };
  return (
    <span
      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${classes[status]}`}
    >
      {status}
    </span>
  );
}

function formatCents(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async (status: StatusFilter) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (status !== "all") params.set("status", status);
      const res = await fetch(`/api/admin/bookings?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load bookings.");
      const data = await res.json();
      setBookings(data.bookings ?? []);
      setSummary(data.summary ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings(statusFilter);
  }, [statusFilter, fetchBookings]);

  const updateBooking = async (id: string, status: "cancelled" | "refunded") => {
    const confirmed = window.confirm(
      `Mark this booking as ${status}? This cannot be undone.`
    );
    if (!confirmed) return;

    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Update failed.");
      await fetchBookings(statusFilter);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Update failed.");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div>
      {/* Page header */}
      <div className="mb-6">
        <p className="text-teal-600 text-xs uppercase tracking-widest font-bold mb-1">
          Management
        </p>
        <h1 className="text-3xl font-black text-stone-800">Bookings</h1>
      </div>

      {/* Summary bar */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border-2 border-amber-100 rounded-2xl p-4">
            <p className="text-xs text-stone-400 uppercase tracking-widest font-bold mb-1">
              Confirmed Revenue
            </p>
            <p className="text-2xl font-black text-teal-700">
              {formatCents(summary.revenueCents)}
            </p>
          </div>
          <div className="bg-white border-2 border-amber-100 rounded-2xl p-4">
            <p className="text-xs text-stone-400 uppercase tracking-widest font-bold mb-1">
              Confirmed
            </p>
            <p className="text-2xl font-black text-green-700">{summary.confirmed}</p>
          </div>
          <div className="bg-white border-2 border-amber-100 rounded-2xl p-4">
            <p className="text-xs text-stone-400 uppercase tracking-widest font-bold mb-1">
              Cancelled
            </p>
            <p className="text-2xl font-black text-red-600">{summary.cancelled}</p>
          </div>
          <div className="bg-white border-2 border-amber-100 rounded-2xl p-4">
            <p className="text-xs text-stone-400 uppercase tracking-widest font-bold mb-1">
              Refunded
            </p>
            <p className="text-2xl font-black text-stone-500">{summary.refunded}</p>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="bg-white border-2 border-amber-100 rounded-2xl overflow-hidden">
        <div className="flex border-b border-amber-100">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-5 py-3 text-sm font-bold transition-colors ${
                statusFilter === tab.key
                  ? "bg-teal-700 text-white"
                  : "text-stone-500 hover:bg-amber-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <div className="p-10 text-center text-stone-400 font-semibold">
            Loading bookings...
          </div>
        ) : error ? (
          <div className="p-10 text-center text-red-600 font-semibold">{error}</div>
        ) : bookings.length === 0 ? (
          <div className="p-10 text-center text-stone-400 font-semibold">
            No bookings found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 border-b border-amber-100">
                <tr>
                  {[
                    "Res. ID",
                    "Pavilion",
                    "Date",
                    "Time",
                    "Hrs",
                    "Guest",
                    "Email",
                    "Amount",
                    "Status",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-bold text-stone-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-50">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-amber-50/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-teal-700 font-bold whitespace-nowrap">
                      {b.reservation_id}
                    </td>
                    <td className="px-4 py-3 text-stone-700 font-semibold whitespace-nowrap">
                      {b.pavilion_name}
                    </td>
                    <td className="px-4 py-3 text-stone-600 whitespace-nowrap">{b.date}</td>
                    <td className="px-4 py-3 text-stone-600 whitespace-nowrap">
                      {formatTime(b.start_time)} &ndash; {formatTime(b.end_time)}
                    </td>
                    <td className="px-4 py-3 text-stone-600 text-center">{b.duration_hours}</td>
                    <td className="px-4 py-3 text-stone-700 font-semibold whitespace-nowrap">
                      {b.guest_name}
                    </td>
                    <td className="px-4 py-3 text-stone-500 whitespace-nowrap">{b.guest_email}</td>
                    <td className="px-4 py-3 text-stone-700 font-bold whitespace-nowrap">
                      {formatCents(b.total_cents)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{statusBadge(b.status)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {b.status === "confirmed" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateBooking(b.id, "cancelled")}
                            disabled={actionLoading === b.id}
                            className="px-3 py-1 text-xs font-bold rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => updateBooking(b.id, "refunded")}
                            disabled={actionLoading === b.id}
                            className="px-3 py-1 text-xs font-bold rounded-lg bg-stone-100 text-stone-500 hover:bg-stone-200 transition-colors disabled:opacity-50"
                          >
                            Refund
                          </button>
                        </div>
                      )}
                      {b.status !== "confirmed" && (
                        <span className="text-xs text-stone-300 italic">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
