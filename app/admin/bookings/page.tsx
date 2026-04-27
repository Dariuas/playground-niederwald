"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
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
  party_size: number | null;
  addons: unknown;
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
type ViewMode = "list" | "calendar";

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
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${classes[status]}`}>
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

// ─────────────────────────────────────────────────────────────
// Refund confirmation modal
// ─────────────────────────────────────────────────────────────
function RefundModal({
  booking,
  onClose,
  onConfirm,
  busy,
}: {
  booking: Booking;
  onClose: () => void;
  onConfirm: (notes: string) => void;
  busy: boolean;
}) {
  const [confirmText, setConfirmText] = useState("");
  const [notes, setNotes] = useState("");
  const canConfirm = confirmText.trim().toUpperCase() === "REFUND";

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <h3 className="text-xl font-black text-stone-800 mb-1">Confirm Refund</h3>
        <p className="text-stone-500 text-sm mb-4">
          This will issue a refund through Square. <strong>Money will leave your account.</strong>
        </p>

        <div className="bg-stone-50 border-2 border-stone-200 rounded-xl p-4 mb-4 text-sm space-y-1">
          <div className="flex justify-between">
            <span className="text-stone-500">Reservation</span>
            <span className="font-mono font-bold text-teal-700">{booking.reservation_id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">Guest</span>
            <span className="text-stone-800 font-semibold">{booking.guest_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">Amount</span>
            <span className="text-red-600 font-black text-base">{formatCents(booking.total_cents)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">Square ID</span>
            <span className="font-mono text-xs text-stone-700 truncate ml-2 max-w-[180px]" title={booking.square_payment_id ?? ""}>
              {booking.square_payment_id ?? "— (manual booking)"}
            </span>
          </div>
        </div>

        <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Refund Reason / Notes</label>
        <input
          type="text" value={notes} onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Customer requested cancellation"
          className="w-full border-2 border-stone-200 rounded-xl px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-teal-400"
        />

        <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">
          Type <span className="font-black text-red-600">REFUND</span> to confirm
        </label>
        <input
          type="text" value={confirmText} onChange={(e) => setConfirmText(e.target.value)}
          autoFocus
          placeholder="REFUND"
          className="w-full border-2 border-stone-200 rounded-xl px-3 py-2 text-sm mb-5 focus:outline-none focus:ring-2 focus:ring-red-400"
        />

        <div className="flex gap-3">
          <button onClick={onClose} disabled={busy}
            className="flex-1 border-2 border-stone-200 text-stone-600 hover:border-stone-300 font-bold py-2.5 rounded-xl text-sm transition-colors">
            Cancel
          </button>
          <button onClick={() => onConfirm(notes)} disabled={!canConfirm || busy}
            className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black py-2.5 rounded-xl text-sm transition-colors">
            {busy ? "Refunding…" : "Confirm Refund"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Add-booking panel
// ─────────────────────────────────────────────────────────────
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
      <button onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-teal-50 transition-colors">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 bg-teal-100 rounded-xl flex items-center justify-center text-teal-700 font-black text-lg">+</span>
          <span className="text-stone-800 font-black">Add Manual Booking / Owner Hold</span>
        </div>
        <span className="text-stone-400 text-lg">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <form onSubmit={handleSubmit} className="px-6 pb-6 border-t border-teal-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Pavilion *</label>
              <select value={form.pavilionId} onChange={(e) => set("pavilionId", e.target.value)} required className={inputCls}>
                {pavilions.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Date *</label>
              <input type="date" required value={form.date} onChange={(e) => set("date", e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Start Time *</label>
              <input type="time" required value={form.startTime} onChange={(e) => set("startTime", e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Duration (hours) *</label>
              <input type="number" required min={1} max={12} value={form.durationHours}
                onChange={(e) => set("durationHours", e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Name *</label>
              <input type="text" required value={form.guestName} placeholder="Owner Hold / Guest Name"
                onChange={(e) => set("guestName", e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Email</label>
              <input type="email" value={form.guestEmail} placeholder="Optional"
                onChange={(e) => set("guestEmail", e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Phone</label>
              <input type="tel" value={form.guestPhone} placeholder="Optional"
                onChange={(e) => set("guestPhone", e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Amount Charged ($)</label>
              <input type="number" min={0} step="0.01" value={form.totalCents === 0 ? "" : form.totalCents / 100}
                placeholder="0.00 for owner hold"
                onChange={(e) => set("totalCents", e.target.value === "" ? 0 : Math.round(parseFloat(e.target.value) * 100))}
                className={inputCls} />
            </div>
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
            }`}>{feedback.message}</div>
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

// ─────────────────────────────────────────────────────────────
// Calendar view — month grid showing booking density per day
// ─────────────────────────────────────────────────────────────
function CalendarView({
  bookings,
  onPickDate,
}: {
  bookings: Booking[];
  onPickDate: (date: string) => void;
}) {
  const [cursor, setCursor] = useState(() => {
    const d = new Date(); d.setDate(1); d.setHours(0, 0, 0, 0); return d;
  });

  const monthLabel = cursor.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const firstDow = cursor.getDay();
  const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();

  // Bucket bookings by date string
  const byDate = useMemo(() => {
    const m = new Map<string, Booking[]>();
    for (const b of bookings) {
      if (b.status === "cancelled" || b.status === "refunded") continue;
      const arr = m.get(b.date) ?? [];
      arr.push(b);
      m.set(b.date, arr);
    }
    return m;
  }, [bookings]);

  const cells: ({ date: string; day: number; bookings: Booking[] } | null)[] = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const ds = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push({ date: ds, day: d, bookings: byDate.get(ds) ?? [] });
  }

  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <div className="bg-white border-2 border-amber-100 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setCursor((c) => new Date(c.getFullYear(), c.getMonth() - 1, 1))}
          className="px-3 py-1.5 rounded-lg border-2 border-stone-200 text-stone-600 hover:border-teal-300 hover:text-teal-700 font-bold text-sm transition-colors">
          ← Prev
        </button>
        <h3 className="text-stone-800 font-black text-lg">{monthLabel}</h3>
        <button
          onClick={() => setCursor((c) => new Date(c.getFullYear(), c.getMonth() + 1, 1))}
          className="px-3 py-1.5 rounded-lg border-2 border-stone-200 text-stone-600 hover:border-teal-300 hover:text-teal-700 font-bold text-sm transition-colors">
          Next →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i} className="text-center text-xs font-black text-stone-400 uppercase tracking-wider py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, i) => {
          if (!cell) return <div key={i} />;
          const count = cell.bookings.length;
          const isToday = cell.date === todayStr;
          const tone =
            count === 0 ? "bg-stone-50 border-stone-100 text-stone-400 hover:border-teal-200" :
            count === 1 ? "bg-green-50 border-green-200 text-green-800 hover:border-green-400" :
            count === 2 ? "bg-amber-50 border-amber-300 text-amber-800 hover:border-amber-500" :
                          "bg-red-50 border-red-300 text-red-700 hover:border-red-500";
          return (
            <button
              key={cell.date}
              onClick={() => onPickDate(cell.date)}
              className={`relative aspect-square rounded-lg border-2 ${tone} ${isToday ? "ring-2 ring-teal-500" : ""} text-left p-1.5 transition-colors`}
              title={count === 0 ? "Available — no bookings" : `${count} booking${count !== 1 ? "s" : ""}`}
            >
              <span className="text-xs font-bold">{cell.day}</span>
              {count > 0 && (
                <span className="absolute bottom-1 right-1 text-[10px] font-black bg-white/70 rounded px-1">{count}</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-3 mt-4 text-xs text-stone-500">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-stone-100 border border-stone-200" /> Open</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-green-100 border border-green-200" /> 1 booking</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-100 border border-amber-300" /> 2 bookings</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-100 border border-red-300" /> 3+ bookings</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────
export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [allMonth, setAllMonth] = useState<Booking[]>([]); // separate set for calendar density
  const [summary, setSummary] = useState<Summary | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [view, setView] = useState<ViewMode>("list");
  const [searchText, setSearchText] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refundTarget, setRefundTarget] = useState<Booking | null>(null);
  const [refundBusy, setRefundBusy] = useState(false);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (searchText) params.set("search", searchText);
      if (searchDate) params.set("date", searchDate);
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
  }, [statusFilter, searchText, searchDate]);

  // Always-on fetch for calendar density (no filters except confirmed)
  const fetchCalendarBookings = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/bookings?status=confirmed`);
      if (!res.ok) return;
      const data = await res.json();
      setAllMonth(data.bookings ?? []);
    } catch {/* ignore */}
  }, []);

  useEffect(() => {
    const t = setTimeout(fetchBookings, 250); // debounce search
    return () => clearTimeout(t);
  }, [fetchBookings]);

  useEffect(() => { fetchCalendarBookings(); }, [fetchCalendarBookings]);

  const openCancel = async (id: string) => {
    if (!window.confirm("Mark this booking as cancelled? (No refund will be issued.)")) return;
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });
      if (!res.ok) throw new Error("Update failed.");
      await fetchBookings();
      await fetchCalendarBookings();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Update failed.");
    } finally {
      setActionLoading(null);
    }
  };

  const confirmRefund = async (notes: string) => {
    if (!refundTarget) return;
    setRefundBusy(true);
    try {
      const res = await fetch(`/api/admin/bookings/${refundTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "refunded", notes }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error ?? "Refund failed.");
      } else {
        setRefundTarget(null);
        await fetchBookings();
        await fetchCalendarBookings();
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : "Refund failed.");
    } finally {
      setRefundBusy(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <p className="text-teal-600 text-xs uppercase tracking-widest font-bold mb-1">Management</p>
        <h1 className="text-3xl font-black text-stone-800">Bookings</h1>
      </div>

      <AddBookingPanel onAdded={() => { fetchBookings(); fetchCalendarBookings(); }} />

      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border-2 border-amber-100 rounded-2xl p-4">
            <p className="text-xs text-stone-400 uppercase tracking-widest font-bold mb-1">Confirmed Revenue</p>
            <p className="text-2xl font-black text-teal-700">{formatCents(summary.revenueCents)}</p>
          </div>
          <div className="bg-white border-2 border-amber-100 rounded-2xl p-4">
            <p className="text-xs text-stone-400 uppercase tracking-widest font-bold mb-1">Confirmed</p>
            <p className="text-2xl font-black text-green-700">{summary.confirmed}</p>
          </div>
          <div className="bg-white border-2 border-amber-100 rounded-2xl p-4">
            <p className="text-xs text-stone-400 uppercase tracking-widest font-bold mb-1">Cancelled</p>
            <p className="text-2xl font-black text-red-600">{summary.cancelled}</p>
          </div>
          <div className="bg-white border-2 border-amber-100 rounded-2xl p-4">
            <p className="text-xs text-stone-400 uppercase tracking-widest font-bold mb-1">Refunded</p>
            <p className="text-2xl font-black text-stone-500">{summary.refunded}</p>
          </div>
        </div>
      )}

      {/* View toggle + search bar */}
      <div className="bg-white border-2 border-amber-100 rounded-2xl p-4 mb-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Search by name, email, or reservation #</label>
            <input
              type="text" value={searchText} onChange={(e) => setSearchText(e.target.value)}
              placeholder="e.g. Sarah, jane@example.com, RES-123456"
              className="w-full border-2 border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
          </div>
          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Date</label>
            <input
              type="date" value={searchDate} onChange={(e) => setSearchDate(e.target.value)}
              className="border-2 border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
          </div>
          {(searchText || searchDate) && (
            <button onClick={() => { setSearchText(""); setSearchDate(""); }}
              className="border-2 border-stone-200 text-stone-500 hover:border-stone-400 px-4 py-2 rounded-xl text-sm font-bold transition-colors">
              Clear
            </button>
          )}
          <div className="ml-auto flex gap-2">
            <button onClick={() => setView("list")}
              className={`px-4 py-2 rounded-xl text-sm font-black transition-colors ${view === "list" ? "bg-teal-700 text-white" : "bg-stone-100 text-stone-500 hover:bg-stone-200"}`}>
              📋 List
            </button>
            <button onClick={() => setView("calendar")}
              className={`px-4 py-2 rounded-xl text-sm font-black transition-colors ${view === "calendar" ? "bg-teal-700 text-white" : "bg-stone-100 text-stone-500 hover:bg-stone-200"}`}>
              📅 Calendar
            </button>
          </div>
        </div>
      </div>

      {view === "calendar" && (
        <div className="mb-6">
          <CalendarView bookings={allMonth} onPickDate={(d) => { setSearchDate(d); setView("list"); }} />
        </div>
      )}

      <div className="bg-white border-2 border-amber-100 rounded-2xl overflow-hidden">
        <div className="flex border-b border-amber-100 overflow-x-auto">
          {STATUS_TABS.map((tab) => (
            <button key={tab.key} onClick={() => setStatusFilter(tab.key)}
              className={`px-5 py-3 text-sm font-bold transition-colors whitespace-nowrap ${
                statusFilter === tab.key ? "bg-teal-700 text-white" : "text-stone-500 hover:bg-amber-50"
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="p-10 text-center text-stone-400 font-semibold">Loading bookings...</div>
        ) : error ? (
          <div className="p-10 text-center text-red-600 font-semibold">{error}</div>
        ) : bookings.length === 0 ? (
          <div className="p-10 text-center text-stone-400 font-semibold">No bookings found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 border-b border-amber-100">
                <tr>
                  {["Res. ID", "Pavilion", "Date", "Time", "Hrs", "Guests", "Guest", "Email", "Amount", "Status", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold text-stone-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-50">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-amber-50/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-teal-700 font-bold whitespace-nowrap">{b.reservation_id}</td>
                    <td className="px-4 py-3 text-stone-700 font-semibold whitespace-nowrap">{b.pavilion_name}</td>
                    <td className="px-4 py-3 text-stone-600 whitespace-nowrap">{b.date}</td>
                    <td className="px-4 py-3 text-stone-600 whitespace-nowrap">{formatTime(b.start_time)} &ndash; {formatTime(b.end_time)}</td>
                    <td className="px-4 py-3 text-stone-600 text-center">{b.duration_hours}</td>
                    <td className="px-4 py-3 text-stone-600 text-center">{b.party_size ?? "—"}</td>
                    <td className="px-4 py-3 text-stone-700 font-semibold whitespace-nowrap">{b.guest_name}</td>
                    <td className="px-4 py-3 text-stone-500 whitespace-nowrap">{b.guest_email}</td>
                    <td className="px-4 py-3 text-stone-700 font-bold whitespace-nowrap">{formatCents(b.total_cents)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{statusBadge(b.status)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {b.status === "confirmed" ? (
                        <div className="flex gap-2">
                          <button onClick={() => openCancel(b.id)} disabled={actionLoading === b.id}
                            className="px-3 py-1 text-xs font-bold rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50">
                            Cancel
                          </button>
                          <button onClick={() => setRefundTarget(b)} disabled={actionLoading === b.id}
                            className="px-3 py-1 text-xs font-bold rounded-lg bg-stone-100 text-stone-500 hover:bg-stone-200 transition-colors disabled:opacity-50">
                            Refund…
                          </button>
                        </div>
                      ) : (
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

      {refundTarget && (
        <RefundModal
          booking={refundTarget}
          onClose={() => !refundBusy && setRefundTarget(null)}
          onConfirm={confirmRefund}
          busy={refundBusy}
        />
      )}
    </div>
  );
}
