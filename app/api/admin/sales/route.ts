import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/adminAuth";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

const SQUARE_BASE = "https://connect.squareup.com/v2";
const SQUARE_VERSION = "2024-10-17";

type SquarePayment = {
  id: string;
  status: string;          // "APPROVED" | "COMPLETED" | "FAILED" | "CANCELED"
  created_at: string;
  amount_money?: { amount: number; currency: string };
  refunded_money?: { amount: number; currency: string };
  total_money?: { amount: number; currency: string };
  note?: string;
  source_type?: string;
  card_details?: { card?: { last_4?: string; card_brand?: string } };
  buyer_email_address?: string;
  receipt_url?: string;
};

type SquareRefund = {
  id: string;
  payment_id?: string;
  status: string;          // "PENDING" | "COMPLETED" | "REJECTED" | "FAILED"
  created_at: string;
  amount_money?: { amount: number; currency: string };
  reason?: string;
};

function squareHeaders() {
  return {
    Authorization: `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
    "Content-Type": "application/json",
    "Square-Version": SQUARE_VERSION,
  };
}

async function fetchAllPages<T>(url: string, listKey: "payments" | "refunds"): Promise<T[]> {
  const out: T[] = [];
  let cursor: string | undefined;
  let attempts = 0;
  do {
    const u = new URL(url);
    if (cursor) u.searchParams.set("cursor", cursor);
    const res = await fetch(u.toString(), { headers: squareHeaders() });
    const data = await res.json();
    if (!res.ok) {
      const msg = data?.errors?.[0]?.detail ?? `Square ${listKey} fetch failed (${res.status})`;
      throw new Error(msg);
    }
    const page = (data[listKey] ?? []) as T[];
    out.push(...page);
    cursor = data.cursor;
    attempts++;
  } while (cursor && attempts < 20); // hard cap
  return out;
}

export async function GET(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const fromParam = searchParams.get("from"); // YYYY-MM-DD
  const toParam   = searchParams.get("to");   // YYYY-MM-DD

  // Default to last 30 days
  const today = new Date();
  const defaultFrom = new Date(today);
  defaultFrom.setDate(defaultFrom.getDate() - 30);

  const fromDate = fromParam ? new Date(`${fromParam}T00:00:00`) : defaultFrom;
  const toDate   = toParam   ? new Date(`${toParam}T23:59:59`)   : today;

  if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime()) || fromDate > toDate) {
    return NextResponse.json({ error: "Invalid date range." }, { status: 400 });
  }

  const beginIso = fromDate.toISOString();
  const endIso   = toDate.toISOString();

  if (!process.env.SQUARE_ACCESS_TOKEN) {
    return NextResponse.json({ error: "SQUARE_ACCESS_TOKEN is not configured." }, { status: 503 });
  }

  // ── Pull Square payments + refunds in parallel ───────────────────
  const paymentsUrl = `${SQUARE_BASE}/payments?begin_time=${encodeURIComponent(beginIso)}&end_time=${encodeURIComponent(endIso)}&sort_order=DESC&limit=100`;
  const refundsUrl  = `${SQUARE_BASE}/refunds?begin_time=${encodeURIComponent(beginIso)}&end_time=${encodeURIComponent(endIso)}&sort_order=DESC&limit=100`;

  let payments: SquarePayment[];
  let refunds:  SquareRefund[];
  try {
    [payments, refunds] = await Promise.all([
      fetchAllPages<SquarePayment>(paymentsUrl, "payments"),
      fetchAllPages<SquareRefund>(refundsUrl, "refunds"),
    ]);
  } catch (err) {
    console.error("Square sales fetch failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Square fetch failed." },
      { status: 502 }
    );
  }

  // ── Pull our bookings for the same window for reconciliation ──────
  const supabase = getSupabaseAdmin();
  const { data: bookings, error: bookingsErr } = await supabase
    .from("pavilion_bookings")
    .select("id, reservation_id, square_payment_id, square_refund_id, total_cents, status, date, guest_name, guest_email, pavilion_name")
    .gte("date", fromDate.toISOString().slice(0, 10))
    .lte("date", toDate.toISOString().slice(0, 10));

  if (bookingsErr) {
    console.error("Bookings fetch failed during reconciliation:", bookingsErr);
  }

  const bookingsByPaymentId = new Map<string, NonNullable<typeof bookings>[number]>();
  for (const b of bookings ?? []) {
    if (b.square_payment_id) bookingsByPaymentId.set(b.square_payment_id, b);
  }

  // ── Aggregate ───────────────────────────────────────────────────
  // Only count APPROVED + COMPLETED as gross sales
  const completed = payments.filter((p) => ["COMPLETED", "APPROVED"].includes(p.status));
  const failed    = payments.filter((p) => ["FAILED", "CANCELED"].includes(p.status));

  const grossCents = completed.reduce((s, p) => s + (p.total_money?.amount ?? p.amount_money?.amount ?? 0), 0);

  // Refunds — only count COMPLETED
  const completedRefunds = refunds.filter((r) => r.status === "COMPLETED");
  const refundedCents = completedRefunds.reduce((s, r) => s + (r.amount_money?.amount ?? 0), 0);

  const netCents = grossCents - refundedCents;

  // Group payments by day for a chart-friendly array
  const byDay: Record<string, number> = {};
  for (const p of completed) {
    const day = p.created_at.slice(0, 10);
    byDay[day] = (byDay[day] ?? 0) + (p.total_money?.amount ?? p.amount_money?.amount ?? 0);
  }
  const dailySeries = Object.entries(byDay)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, cents]) => ({ date, cents }));

  // ── Reconciliation ─────────────────────────────────────────────
  // Square charges with no matching booking row in our DB
  const orphanCharges = completed
    .filter((p) => !bookingsByPaymentId.has(p.id))
    .map((p) => ({
      paymentId: p.id,
      createdAt: p.created_at,
      amountCents: p.total_money?.amount ?? p.amount_money?.amount ?? 0,
      note: p.note ?? "",
      receiptUrl: p.receipt_url ?? null,
      buyerEmail: p.buyer_email_address ?? null,
    }));

  // Booking rows that say "confirmed" but have no Square payment id (could be owner holds — flag, don't error)
  const bookingsWithoutPayment = (bookings ?? [])
    .filter((b) => b.status === "confirmed" && !b.square_payment_id && (b.total_cents ?? 0) > 0)
    .map((b) => ({
      reservationId: b.reservation_id,
      guestName: b.guest_name,
      guestEmail: b.guest_email,
      pavilionName: b.pavilion_name,
      date: b.date,
      amountCents: b.total_cents,
    }));

  // Booking rows marked refunded but with no square_refund_id
  const refundsWithoutSquareId = (bookings ?? [])
    .filter((b) => b.status === "refunded" && !b.square_refund_id && b.square_payment_id)
    .map((b) => ({
      reservationId: b.reservation_id,
      guestName: b.guest_name,
      paymentId: b.square_payment_id,
      amountCents: b.total_cents,
    }));

  return NextResponse.json({
    range: { from: fromDate.toISOString().slice(0, 10), to: toDate.toISOString().slice(0, 10) },
    summary: {
      grossCents,
      refundedCents,
      netCents,
      paymentCount: completed.length,
      failedCount: failed.length,
      refundCount: completedRefunds.length,
    },
    dailySeries,
    payments: completed.map((p) => ({
      id: p.id,
      createdAt: p.created_at,
      amountCents: p.total_money?.amount ?? p.amount_money?.amount ?? 0,
      refundedCents: p.refunded_money?.amount ?? 0,
      status: p.status,
      note: p.note ?? "",
      cardLast4: p.card_details?.card?.last_4 ?? null,
      cardBrand: p.card_details?.card?.card_brand ?? null,
      buyerEmail: p.buyer_email_address ?? null,
      receiptUrl: p.receipt_url ?? null,
      reservationId: bookingsByPaymentId.get(p.id)?.reservation_id ?? null,
      bookingStatus: bookingsByPaymentId.get(p.id)?.status ?? null,
    })),
    refunds: completedRefunds.map((r) => ({
      id: r.id,
      paymentId: r.payment_id ?? null,
      createdAt: r.created_at,
      amountCents: r.amount_money?.amount ?? 0,
      reason: r.reason ?? "",
    })),
    reconciliation: {
      orphanCharges,
      bookingsWithoutPayment,
      refundsWithoutSquareId,
    },
  });
}
