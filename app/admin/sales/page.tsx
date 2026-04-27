"use client";

import { useEffect, useState, useCallback } from "react";

type Summary = {
  grossCents: number;
  refundedCents: number;
  netCents: number;
  paymentCount: number;
  failedCount: number;
  refundCount: number;
};

type Payment = {
  id: string;
  createdAt: string;
  amountCents: number;
  refundedCents: number;
  status: string;
  note: string;
  cardLast4: string | null;
  cardBrand: string | null;
  buyerEmail: string | null;
  receiptUrl: string | null;
  reservationId: string | null;
  bookingStatus: string | null;
};

type Refund = {
  id: string;
  paymentId: string | null;
  createdAt: string;
  amountCents: number;
  reason: string;
};

type Reconciliation = {
  orphanCharges: {
    paymentId: string;
    createdAt: string;
    amountCents: number;
    note: string;
    receiptUrl: string | null;
    buyerEmail: string | null;
  }[];
  bookingsWithoutPayment: {
    reservationId: string;
    guestName: string;
    guestEmail: string;
    pavilionName: string;
    date: string;
    amountCents: number;
  }[];
  refundsWithoutSquareId: {
    reservationId: string;
    guestName: string;
    paymentId: string | null;
    amountCents: number;
  }[];
};

type SalesResponse = {
  range: { from: string; to: string };
  summary: Summary;
  dailySeries: { date: string; cents: number }[];
  payments: Payment[];
  refunds: Refund[];
  reconciliation: Reconciliation;
};

function formatCents(c: number) {
  return `$${(c / 100).toFixed(2)}`;
}

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit",
  });
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}
function daysAgoStr(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

export default function AdminSalesPage() {
  const [from, setFrom] = useState(daysAgoStr(30));
  const [to, setTo] = useState(todayStr());
  const [data, setData] = useState<SalesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/sales?from=${from}&to=${to}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to load sales.");
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // For the daily bar chart — find max for scaling
  const maxDayCents = data?.dailySeries.reduce((m, d) => Math.max(m, d.cents), 0) ?? 0;

  return (
    <div>
      <div className="mb-6">
        <p className="text-teal-600 text-xs uppercase tracking-widest font-bold mb-1">Reconciliation</p>
        <h1 className="text-3xl font-black text-stone-800">Sales</h1>
        <p className="text-stone-500 text-sm mt-1">
          Live data from Square — cross-checked against your booking records.
        </p>
      </div>

      {/* Range picker */}
      <div className="bg-white border-2 border-amber-100 rounded-2xl p-4 mb-6 flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">From</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
            className="border-2 border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
        </div>
        <div>
          <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">To</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
            className="border-2 border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
        </div>
        <button onClick={fetchData} disabled={loading}
          className="bg-teal-700 hover:bg-teal-600 disabled:opacity-60 text-white font-black px-5 py-2 rounded-xl text-sm transition-colors">
          {loading ? "Loading…" : "Refresh"}
        </button>
        <div className="ml-auto flex gap-1.5 flex-wrap">
          {[
            { label: "7d",  days: 7  },
            { label: "30d", days: 30 },
            { label: "90d", days: 90 },
            { label: "1y",  days: 365 },
          ].map((p) => (
            <button key={p.label}
              onClick={() => { setFrom(daysAgoStr(p.days)); setTo(todayStr()); }}
              className="border-2 border-stone-200 hover:border-teal-300 text-stone-500 hover:text-teal-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 text-red-700 font-semibold text-sm mb-6">
          {error}
        </div>
      )}

      {data && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <SummaryCard label="Gross" value={formatCents(data.summary.grossCents)} tone="teal" sub={`${data.summary.paymentCount} charges`} />
            <SummaryCard label="Refunded" value={formatCents(data.summary.refundedCents)} tone="red" sub={`${data.summary.refundCount} refunds`} />
            <SummaryCard label="Net" value={formatCents(data.summary.netCents)} tone="green" sub="Gross − Refunds" />
            <SummaryCard label="Failed" value={String(data.summary.failedCount)} tone="amber" sub="Square declines" />
          </div>

          {/* Daily series — simple inline bar chart */}
          {data.dailySeries.length > 0 && (
            <div className="bg-white border-2 border-amber-100 rounded-2xl p-5 mb-6">
              <h3 className="text-stone-800 font-black text-base mb-3">Daily revenue</h3>
              <div className="space-y-1">
                {data.dailySeries.map((d) => {
                  const pct = maxDayCents > 0 ? (d.cents / maxDayCents) * 100 : 0;
                  return (
                    <div key={d.date} className="flex items-center gap-3 text-xs">
                      <span className="w-24 text-stone-500 font-mono">{d.date}</span>
                      <div className="flex-1 bg-stone-100 rounded h-5 overflow-hidden">
                        <div className="bg-teal-500 h-full rounded transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-20 text-right font-bold text-stone-700">{formatCents(d.cents)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Reconciliation flags */}
          <ReconciliationPanel recon={data.reconciliation} />

          {/* Payments table */}
          <div className="bg-white border-2 border-amber-100 rounded-2xl overflow-hidden mb-6">
            <div className="px-5 py-4 border-b border-amber-100 flex items-center justify-between">
              <h3 className="text-stone-800 font-black text-base">Payments</h3>
              <span className="text-xs text-stone-400 font-semibold">{data.payments.length} rows</span>
            </div>
            {data.payments.length === 0 ? (
              <div className="p-10 text-center text-stone-400 font-semibold">No payments in this range.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-stone-50 border-b border-amber-100">
                    <tr>
                      {["When", "Amount", "Refunded", "Card", "Buyer", "Reservation", "Note"].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-bold text-stone-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-50">
                    {data.payments.map((p) => (
                      <tr key={p.id} className="hover:bg-amber-50/40 transition-colors">
                        <td className="px-4 py-3 text-stone-600 whitespace-nowrap">{formatDateTime(p.createdAt)}</td>
                        <td className="px-4 py-3 font-bold text-teal-700 whitespace-nowrap">{formatCents(p.amountCents)}</td>
                        <td className="px-4 py-3 text-red-600 whitespace-nowrap">{p.refundedCents > 0 ? formatCents(p.refundedCents) : "—"}</td>
                        <td className="px-4 py-3 text-stone-500 whitespace-nowrap">
                          {p.cardBrand ? `${p.cardBrand} •••${p.cardLast4 ?? "??"}` : "—"}
                        </td>
                        <td className="px-4 py-3 text-stone-500 whitespace-nowrap text-xs">{p.buyerEmail ?? "—"}</td>
                        <td className="px-4 py-3 whitespace-nowrap font-mono text-xs">
                          {p.reservationId ? (
                            <span className="text-teal-700 font-bold">{p.reservationId}</span>
                          ) : (
                            <span className="text-red-500 font-bold">⚠ none</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-stone-500 text-xs max-w-xs truncate" title={p.note}>{p.note || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function SummaryCard({ label, value, sub, tone }: { label: string; value: string; sub: string; tone: "teal" | "red" | "green" | "amber" }) {
  const tones = {
    teal:  "text-teal-700",
    red:   "text-red-600",
    green: "text-green-700",
    amber: "text-amber-600",
  };
  return (
    <div className="bg-white border-2 border-amber-100 rounded-2xl p-4">
      <p className="text-xs text-stone-400 uppercase tracking-widest font-bold mb-1">{label}</p>
      <p className={`text-2xl font-black ${tones[tone]}`}>{value}</p>
      <p className="text-stone-400 text-xs mt-0.5">{sub}</p>
    </div>
  );
}

function ReconciliationPanel({ recon }: { recon: Reconciliation }) {
  const total = recon.orphanCharges.length + recon.bookingsWithoutPayment.length + recon.refundsWithoutSquareId.length;

  if (total === 0) {
    return (
      <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-5 mb-6">
        <p className="text-green-700 font-black text-sm">✓ Books are reconciled</p>
        <p className="text-stone-600 text-xs mt-1">Every Square charge has a matching booking row, every refund has a Square ID.</p>
      </div>
    );
  }

  return (
    <div className="bg-orange-50 border-2 border-orange-300 rounded-2xl p-5 mb-6 space-y-4">
      <div>
        <p className="text-orange-700 font-black text-sm">⚠ {total} reconciliation issue{total !== 1 ? "s" : ""}</p>
        <p className="text-stone-600 text-xs mt-1">Square and the booking table don&apos;t agree. Investigate each row below.</p>
      </div>

      {recon.orphanCharges.length > 0 && (
        <div>
          <p className="text-stone-700 font-black text-xs uppercase tracking-widest mb-2">Charges with no booking row ({recon.orphanCharges.length})</p>
          <div className="bg-white border border-orange-200 rounded-xl overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-stone-50">
                <tr>
                  {["Square ID", "When", "Amount", "Buyer", "Note", ""].map((h) => (
                    <th key={h} className="px-3 py-2 text-left font-bold text-stone-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {recon.orphanCharges.map((c) => (
                  <tr key={c.paymentId}>
                    <td className="px-3 py-2 font-mono text-[11px] text-stone-700">{c.paymentId}</td>
                    <td className="px-3 py-2 text-stone-500 whitespace-nowrap">{formatDateTime(c.createdAt)}</td>
                    <td className="px-3 py-2 font-bold text-teal-700">{formatCents(c.amountCents)}</td>
                    <td className="px-3 py-2 text-stone-500">{c.buyerEmail ?? "—"}</td>
                    <td className="px-3 py-2 text-stone-500 max-w-[200px] truncate" title={c.note}>{c.note || "—"}</td>
                    <td className="px-3 py-2">
                      {c.receiptUrl && (
                        <a href={c.receiptUrl} target="_blank" rel="noreferrer"
                          className="text-teal-600 hover:text-teal-800 font-bold">Receipt ↗</a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {recon.bookingsWithoutPayment.length > 0 && (
        <div>
          <p className="text-stone-700 font-black text-xs uppercase tracking-widest mb-2">Confirmed bookings missing a Square charge ({recon.bookingsWithoutPayment.length})</p>
          <p className="text-stone-500 text-xs mb-2">Could be admin-created owner holds — verify the amount is intentional.</p>
          <div className="bg-white border border-orange-200 rounded-xl overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-stone-50">
                <tr>
                  {["Reservation", "Date", "Pavilion", "Guest", "Amount"].map((h) => (
                    <th key={h} className="px-3 py-2 text-left font-bold text-stone-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {recon.bookingsWithoutPayment.map((b) => (
                  <tr key={b.reservationId}>
                    <td className="px-3 py-2 font-mono font-bold text-teal-700">{b.reservationId}</td>
                    <td className="px-3 py-2 text-stone-600 whitespace-nowrap">{b.date}</td>
                    <td className="px-3 py-2 text-stone-700 font-semibold">{b.pavilionName}</td>
                    <td className="px-3 py-2 text-stone-500">{b.guestName} {b.guestEmail ? `(${b.guestEmail})` : ""}</td>
                    <td className="px-3 py-2 font-bold text-stone-700">{formatCents(b.amountCents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {recon.refundsWithoutSquareId.length > 0 && (
        <div>
          <p className="text-stone-700 font-black text-xs uppercase tracking-widest mb-2">Refunded bookings missing Square refund ID ({recon.refundsWithoutSquareId.length})</p>
          <p className="text-stone-500 text-xs mb-2">Status was set to refunded but Square didn&apos;t return an ID — check the Square dashboard manually.</p>
          <div className="bg-white border border-orange-200 rounded-xl overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-stone-50">
                <tr>
                  {["Reservation", "Guest", "Square Payment", "Amount"].map((h) => (
                    <th key={h} className="px-3 py-2 text-left font-bold text-stone-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {recon.refundsWithoutSquareId.map((r) => (
                  <tr key={r.reservationId}>
                    <td className="px-3 py-2 font-mono font-bold text-teal-700">{r.reservationId}</td>
                    <td className="px-3 py-2 text-stone-500">{r.guestName}</td>
                    <td className="px-3 py-2 font-mono text-[11px] text-stone-700">{r.paymentId ?? "—"}</td>
                    <td className="px-3 py-2 font-bold text-stone-700">{formatCents(r.amountCents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
