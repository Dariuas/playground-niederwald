import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase";

/**
 * Square webhook receiver.
 *
 * Configure in Square Dashboard → Developer → Webhooks → Subscriptions:
 *   URL:    {site}/api/square/webhook
 *   Events: refund.created, refund.updated, payment.updated
 *
 * Required env:
 *   SQUARE_WEBHOOK_SIGNATURE_KEY  — signing key shown in the dashboard
 *   SQUARE_WEBHOOK_URL            — the exact URL you registered (no trailing slash)
 */
export async function POST(req: NextRequest) {
  const signingKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;
  const webhookUrl = process.env.SQUARE_WEBHOOK_URL;

  if (!signingKey || !webhookUrl) {
    return NextResponse.json({ error: "Webhook not configured." }, { status: 503 });
  }

  const rawBody = await req.text();
  const sigHeader = req.headers.get("x-square-hmacsha256-signature");

  if (!sigHeader || !verifySignature(webhookUrl + rawBody, sigHeader, signingKey)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  let event: SquareEvent;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "refund.created":
      case "refund.updated":
        await handleRefund(event);
        break;
      case "payment.updated":
        await handlePaymentUpdated(event);
        break;
      default:
        // Subscribed to events we don't act on yet — ack and move on
        break;
    }
  } catch (err) {
    console.error("Square webhook handler error:", err);
    return NextResponse.json({ error: "Handler error." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

function verifySignature(payload: string, headerSig: string, key: string): boolean {
  const expected = createHmac("sha256", key).update(payload).digest("base64");
  const a = Buffer.from(expected);
  const b = Buffer.from(headerSig);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

type SquareEvent = {
  type: string;
  data?: {
    object?: {
      refund?: { id?: string; payment_id?: string; status?: string; amount_money?: { amount: number } };
      payment?: { id?: string; status?: string; refunded_money?: { amount: number } };
    };
  };
};

async function handleRefund(event: SquareEvent) {
  const refund = event.data?.object?.refund;
  const paymentId = refund?.payment_id;
  const refundId = refund?.id;
  const status = refund?.status;

  if (!paymentId) return;

  // Square refund statuses: PENDING, COMPLETED, REJECTED, FAILED
  // Only flip the booking to refunded when the refund completes.
  if (status !== "COMPLETED") return;

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("pavilion_bookings")
    .update({
      status: "refunded",
      square_refund_id: refundId ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("square_payment_id", paymentId)
    .neq("status", "refunded"); // idempotent

  if (error) {
    console.error("Failed to mark booking refunded from webhook:", { paymentId, refundId, error });
    throw error;
  }
}

async function handlePaymentUpdated(event: SquareEvent) {
  // If the full amount has been refunded via Square dashboard without a
  // refund event firing first (rare), the payment.updated event carries
  // refunded_money equal to the original amount. Use it as a backstop.
  const payment = event.data?.object?.payment;
  const paymentId = payment?.id;
  const refundedAmount = payment?.refunded_money?.amount ?? 0;

  if (!paymentId || refundedAmount <= 0) return;

  const supabase = getSupabaseAdmin();
  const { data: booking } = await supabase
    .from("pavilion_bookings")
    .select("id, total_cents, status")
    .eq("square_payment_id", paymentId)
    .single();

  if (!booking || booking.status === "refunded") return;
  if (refundedAmount < booking.total_cents) return; // partial refund — leave alone

  await supabase
    .from("pavilion_bookings")
    .update({ status: "refunded", updated_at: new Date().toISOString() })
    .eq("id", booking.id);
}
