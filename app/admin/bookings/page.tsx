"use client";

import { useEffect, useState, useCallback } from "react";
import { pavilions } from "@/data/pavilions";

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

const EMPTY_FORM = {
  pavilionId: pavilions[0]?.id ?? "",
  date: "",
  startTime: "10:00",
  durationHours: 2,
  guestName: "",
  guestEmail: "",
  guestPhone: "",
  notes: "",
  totalCents: 0,
};

function AddBookingPanel({ onAdded }: { onAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  function set(field: keyof typeof EMPTY_FORM, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFeedback(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          durationHours: Number(form.durationHours),
          totalCents: Math.round(Number(form.totalCents) * 100),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback({ type: "error", message: data.error ?? "Failed to create booking." });
      } else {
        setFeedback({ type: "success", message: `Booking created — ID: ${data.reservationId}` });
        setForm(EMPTY_FORM);
        onAdded();
      }
    } catch {
      setFeedback({ type: "error", message: "Network error. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  const inputCls = "w-full border-2 border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-teal-400";

  return (
    <div className="mb-6 bg-white border-2 border-teal-200 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-teal-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 bg-teal-100 rounded-xl flex items-center justify-center text-teal-700 font-black text-lg">+</span>
          <span className="text-stone-800 font-black">Add Manual Booking / Owner Hold</span>
        </div>
        <span className="text-stone-400 text-lg">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <form onSubmit={handleSubmit} className="px-6 pb-6 border-t border-teal-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
            {/* Pavilion */}
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Pavilion *</label>
              <select value={form.pavilionId} onChange={(e) => set("pavilionId", e.target.value)} required className={inputCls}>
                {pavilions.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Date *</label>
              <input type="date" required value={form.date} onChange={(e) => set("date", e.target.value)} className={inputCls} />
            </div>

            {/* Start time */}
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Start Time *</label>
              <input type="time" required value={form.startTime} onChange={(e) => set("startTime", e.target.value)} className={inputCls} />
            </div>

            {/* Duration */}
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Duration (hours) *</label>
              <input type="number" required min={1} max={12} value={form.durationHours}
                onChange={(e) => set("durationHours", e.target.value)} className={inputCls} />
            </div>

            {/* Guest name */}
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Name *</label>
              <input type="text" required value={form.guestName} placeholder="Owner Hold / Guest Name"
                onChange={(e) => set("guestName", e.target.value)} className={inputCls} />
            </div>

            {/* Guest email */}
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Email</label>
              <input type="email" value={form.guestEmail} placeholder="Optional"
                onChange={(e) => set("guestEmail", e.target.value)} className={inputCls} />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Phone</label>
              <input type="tel" value={form.guestPhone} placeholder="Optional"
                onChange={(e) => set("guestPhone", e.target.value)} className={inputCls} />
            </div>

            {/* Total charged */}
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Amount Charged ($)</label>
              <input type="number" min={0} step="0.01" value={form.totalCents === 0 ? "" : form.totalCents / 100}
                placeholder="0.00 for owner hold"
                onChange={(e) => set("totalCents", e.target.value === "" ? 0 : Math.round(parseFloat(e.target.value) * 100))}
                className={inputCls} />
            </div>

            {/* Notes — full width */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Notes</label>
              <textarea value={form.notes} placeholder="e.g. Owner hold — staff event, no charge"
                onChange={(e) => set("notes", e.target.value)} rows={2}
                className={inputCls + " resize-none"} />
            </div>
          </div>

          {feedback && (
            <div className={`mt-4 rounded-xl px-4 py-3 text-sm font-semibold ${
              feedback.type === "success"
                ? "bg-green-50 border border-green-200 text-green-800"
                : "bg-red-50 border border-red-200 text-red-700"
            }`}>
              {feedback.message}
            </div>
          )}

          <div className="flex gap-3 mt-4">
            <button type="submit" disabled={submitting}
              className="bg-teal-700 hover:bg-teal-600 disabled:opacity-60 text-white font-black px-6 py-2.5 rounded-xl text-sm transition-colors">
              {submitting ? "Saving…" : "Add Booking"}
            </button>
            <button type="button" onClick={() => { setOpen(false); setFeedback(null); }}
              className="border-2 border-stone-200 text-stone-500 hover:border-stone-300 font-bold px-5 py-2.5 rounded-xl text-sm transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
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

      <AddBookingPanel onAdded={() => fetchBookings(statusFilter)} />

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
