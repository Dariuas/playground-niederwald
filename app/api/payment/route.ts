import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getResend, FROM, NOTIFY_EMAIL } from "@/lib/resend";
import { orderConfirmationEmail, orderNotificationEmail } from "@/lib/emailTemplates";
import { generateQRDataURL } from "@/lib/qrcode";
import { products, addons } from "@/data/products";

const TAX_RATE = 0.08;

const CATALOG = new Map<string, { id: string; name: string; price: number }>();
[...products, ...addons].forEach((p) =>
  CATALOG.set(p.id, { id: p.id, name: p.name, price: p.price })
);

export async function POST(req: NextRequest) {
  const { token, amountCents, note, customerName, customerEmail, items } =
    await req.json();

  if (!token) {
    return NextResponse.json({ error: "Missing token." }, { status: 400 });
  }
  if (!amountCents) {
    return NextResponse.json({ error: "Missing amount." }, { status: 400 });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
  }
  if (
    customerEmail &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)
  ) {
    return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
  }

  // ── Server-side recompute against the catalog ──────────────────────
  // Never trust client-supplied prices or totals. Look every line up by id
  // in data/products.ts and recompute. Reject on >$0.01 drift.
  type Line = { id: string; name: string; quantity: number; price: number; lineCents: number };
  const lines: Line[] = [];
  let subtotalCents = 0;
  for (const raw of items) {
    if (!raw || typeof raw.id !== "string") {
      return NextResponse.json({ error: "Invalid cart item." }, { status: 400 });
    }
    const qty = Math.floor(Number(raw.quantity));
    if (!Number.isFinite(qty) || qty <= 0) {
      return NextResponse.json({ error: "Invalid quantity." }, { status: 400 });
    }
    if (qty > 200) {
      return NextResponse.json({ error: "Cart quantity is unreasonably high." }, { status: 400 });
    }
    const meta = CATALOG.get(raw.id);
    if (!meta) {
      return NextResponse.json({ error: `Unknown item: ${raw.id}` }, { status: 400 });
    }
    const lineCents = meta.price * qty;
    lines.push({
      id: meta.id,
      name: meta.name,
      quantity: qty,
      price: meta.price / 100,
      lineCents,
    });
    subtotalCents += lineCents;
  }

  const taxCents = Math.round(subtotalCents * TAX_RATE);
  const grandCents = subtotalCents + taxCents;
  const clientAmountCents = Math.round(Number(amountCents));

  if (Math.abs(grandCents - clientAmountCents) > 1) {
    console.warn("Cart total mismatch", {
      subtotalCents,
      taxCents,
      grandCents,
      clientAmountCents,
    });
    return NextResponse.json(
      { error: "Pricing mismatch. Please refresh the page and try again." },
      { status: 400 }
    );
  }

  const orderNumber = "PN-" + Math.floor(100000 + Math.random() * 900000).toString();

  // Charge the card via Square
  const squareRes = await fetch("https://connect.squareup.com/v2/payments", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
      "Square-Version": "2024-10-17",
    },
    body: JSON.stringify({
      source_id: token,
      idempotency_key: randomUUID(),
      amount_money: { amount: grandCents, currency: "USD" },
      location_id: process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID,
      note: note ?? `The Playground @niederwald — ${orderNumber}`,
    }),
  });

  const squareData = await squareRes.json();

  if (!squareRes.ok) {
    const msg = squareData.errors?.[0]?.detail ?? "Payment failed. Please try again.";
    return NextResponse.json({ error: msg }, { status: squareRes.status });
  }

  const paymentId: string = squareData.payment.id;

  // Send emails with QR code if Resend is configured. Failures are non-fatal.
  if (process.env.RESEND_API_KEY && customerEmail) {
    const qrContent = [
      `ORDER: ${orderNumber}`,
      `The Playground @niederwald`,
      `Guest: ${customerName ?? "Guest"}`,
      ...lines.map((l) => `${l.name} ×${l.quantity}`),
      `Total: $${(grandCents / 100).toFixed(2)}`,
    ].join("\n");

    const qrDataUrl = await generateQRDataURL(qrContent);

    await Promise.all([
      getResend().emails.send({
        from: FROM,
        to: customerEmail,
        subject: `Order Confirmed — ${orderNumber} — The Playground @niederwald`,
        html: orderConfirmationEmail({
          customerName: customerName ?? "Guest",
          orderNumber,
          items: lines.map((l) => ({ name: l.name, quantity: l.quantity, price: l.price })),
          totalPrice: subtotalCents / 100,
          tax: taxCents / 100,
          grandTotal: grandCents / 100,
          qrDataUrl,
        }),
      }),
      getResend().emails.send({
        from: FROM,
        to: NOTIFY_EMAIL,
        subject: `[Order] ${orderNumber} — ${customerName ?? "Guest"} — $${(grandCents / 100).toFixed(2)}`,
        html: orderNotificationEmail({
          customerName: customerName ?? "Guest",
          customerEmail: customerEmail ?? "",
          orderNumber,
          items: lines.map((l) => ({ name: l.name, quantity: l.quantity, price: l.price })),
          grandTotal: grandCents / 100,
          paymentId,
        }),
      }),
    ]).catch((err) => {
      console.error("Email send failed (non-fatal):", err);
    });
  }

  return NextResponse.json({ ok: true, paymentId, orderNumber, status: squareData.payment.status });
}
