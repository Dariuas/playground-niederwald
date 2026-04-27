import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getSupabaseAdmin, addHoursToTime } from "@/lib/supabase";
import { getResend, FROM, NOTIFY_EMAIL } from "@/lib/resend";
import { pavilionConfirmationEmail, pavilionNotificationEmail } from "@/lib/emailTemplates";
import { generateQRDataURL } from "@/lib/qrcode";
import { pavilions } from "@/data/pavilions";

const DEFAULT_FIRST_HOUR_CENTS = 3500;
const DEFAULT_ADD_HOUR_CENTS = 1500;

export async function POST(req: NextRequest) {
  const {
    pavilionId, pavilionName,
    date, time, duration, total,
    name, email, phone,
    squareToken,
  } = await req.json();

  // ── Validate required fields ──────────────────────────────────────
  if (!pavilionId || !pavilionName || !date || !time || !duration || !name || !email) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }
  if (!squareToken) {
    return NextResponse.json({ error: "Payment token required." }, { status: 400 });
  }
  if (typeof duration !== "number" || duration < 1 || duration > 12) {
    return NextResponse.json({ error: "Duration must be between 1 and 12 hours." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
  }
  const bookingDate = new Date(date + "T12:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sixMonthsOut = new Date(today);
  sixMonthsOut.setMonth(sixMonthsOut.getMonth() + 6);
  const openingDay = new Date("2026-05-16T00:00:00");
  const minAllowed = today > openingDay ? today : openingDay;
  if (isNaN(bookingDate.getTime()) || bookingDate < minAllowed || bookingDate > sixMonthsOut) {
    return NextResponse.json({ error: "Reservations are not available before May 16th." }, { status: 400 });
  }

  const endTime = addHoursToTime(time, duration);
  const supabase = getSupabaseAdmin();

  // ── Validate pavilion + recompute total server-side ───────────────
  // Never trust the client-supplied total. Recompute from pavilion_configs
  // (which the admin can edit) falling back to defaults.
  const staticPavilion = pavilions.find((p) => p.id === pavilionId);
  if (!staticPavilion) {
    return NextResponse.json({ error: "Unknown pavilion." }, { status: 400 });
  }

  const { data: cfg } = await supabase
    .from("pavilion_configs")
    .select("first_hour_price_cents, add_hour_price_cents, is_active")
    .eq("pavilion_id", pavilionId)
    .single();

  if (cfg && cfg.is_active === false) {
    return NextResponse.json(
      { error: "This pavilion is not currently available for booking." },
      { status: 400 }
    );
  }

  const firstHourCents = cfg?.first_hour_price_cents ?? DEFAULT_FIRST_HOUR_CENTS;
  const addHourCents = cfg?.add_hour_price_cents ?? DEFAULT_ADD_HOUR_CENTS;
  const serverAmountCents = firstHourCents + Math.max(0, duration - 1) * addHourCents;

  const clientAmountCents = Math.round(Number(total) * 100);
  if (Math.abs(serverAmountCents - clientAmountCents) > 1) {
    console.warn("Reservation total mismatch", { pavilionId, duration, serverAmountCents, clientAmountCents });
    return NextResponse.json(
      { error: "Pricing mismatch. Please refresh the page and try again." },
      { status: 400 }
    );
  }

  // ── Availability check (server-side to prevent race conditions) ───
  const { data: conflicts, error: availErr } = await supabase
    .from("pavilion_bookings")
    .select("id")
    .eq("pavilion_id", pavilionId)
    .eq("date", date)
    .not("status", "in", '("cancelled","refunded")')
    .lt("start_time", endTime)
    .gt("end_time", time);

  if (availErr) {
    console.error("Availability check failed:", availErr);
    return NextResponse.json({ error: "Could not verify availability. Please try again." }, { status: 500 });
  }

  if (conflicts && conflicts.length > 0) {
    return NextResponse.json(
      { error: "This time slot was just booked by someone else. Please choose a different time." },
      { status: 409 }
    );
  }

  // ── Charge via Square ─────────────────────────────────────────────
  const amountCents = serverAmountCents;
  const reservationId = "RES-" + Math.floor(100000 + Math.random() * 900000).toString();

  const squareRes = await fetch("https://connect.squareup.com/v2/payments", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
      "Square-Version": "2024-10-17",
    },
    body: JSON.stringify({
      source_id: squareToken,
      idempotency_key: randomUUID(),
      amount_money: { amount: amountCents, currency: "USD" },
      location_id: process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID,
      note: `${reservationId} — ${pavilionName} — ${date} ${time}`,
      buyer_email_address: email,
    }),
  });

  const squareData = await squareRes.json();

  if (!squareRes.ok) {
    const msg = squareData.errors?.[0]?.detail ?? "Payment failed. Please try again.";
    return NextResponse.json({ error: msg }, { status: squareRes.status });
  }

  const squarePaymentId: string = squareData.payment.id;

  // ── Write booking to DB ───────────────────────────────────────────
  const { error: dbError } = await supabase.from("pavilion_bookings").insert({
    reservation_id:    reservationId,
    pavilion_id:       pavilionId,
    pavilion_name:     pavilionName,
    date,
    start_time:        time,
    duration_hours:    duration,
    end_time:          endTime,
    guest_name:        name,
    guest_email:       email,
    guest_phone:       phone || null,
    total_cents:       amountCents,
    status:            "confirmed",
    square_payment_id: squarePaymentId,
  });

  if (dbError) {
    // Payment succeeded but DB write failed — record for manual reconciliation
    console.error("DB write failed after successful payment:", {
      reservationId,
      squarePaymentId,
      pavilionId,
      date,
      time,
      guest: email,
      dbError,
    });
    try {
      const { error: reconErr } = await supabase.from("failed_reservations").insert({
        reservation_id:    reservationId,
        square_payment_id: squarePaymentId,
        pavilion_id:       pavilionId,
        pavilion_name:     pavilionName,
        date,
        start_time:        time,
        duration_hours:    duration,
        guest_name:        name,
        guest_email:       email,
        guest_phone:       phone || null,
        total_cents:       amountCents,
        db_error:          dbError.message ?? String(dbError),
      });
      if (reconErr) {
        console.error("failed_reservations insert also failed:", reconErr);
      }
    } catch (err) {
      console.error("failed_reservations insert threw:", err);
    }
    // Still return success — payment went through and we have a Square ID for recovery
  }

  // ── Send confirmation emails ──────────────────────────────────────
  if (process.env.RESEND_API_KEY) {
    const qrContent = [
      `RESERVATION: ${reservationId}`,
      `The Playground @niederwald`,
      pavilionName,
      `Date: ${date} at ${time}`,
      `Duration: ${duration} hr${duration !== 1 ? "s" : ""}`,
      `Guest: ${name}`,
      `Payment: ${squarePaymentId}`,
    ].join("\n");

    const qrDataUrl = await generateQRDataURL(qrContent);

    await Promise.all([
      getResend().emails.send({
        from: FROM,
        to: email,
        subject: `Pavilion Reserved — ${pavilionName} on ${date}`,
        html: pavilionConfirmationEmail({
          customerName: name,
          pavilionName,
          date,
          time,
          duration,
          total,
          qrDataUrl,
          reservationId,
        }),
      }),
      getResend().emails.send({
        from: FROM,
        to: NOTIFY_EMAIL,
        subject: `[Pavilion] ${pavilionName} — ${date} — ${name} — $${total}`,
        html: pavilionNotificationEmail({
          customerName: name,
          customerEmail: email,
          customerPhone: phone,
          pavilionName,
          date,
          time,
          duration,
          total,
          reservationId,
        }),
      }),
    ]).catch((err) => {
      console.error("Email send failed (non-fatal):", err);
    });
  }

  return NextResponse.json({ ok: true, reservationId, squarePaymentId });
}
