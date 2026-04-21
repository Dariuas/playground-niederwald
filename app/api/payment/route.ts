import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getResend, FROM, NOTIFY_EMAIL } from "@/lib/resend";
import { orderConfirmationEmail, orderNotificationEmail } from "@/lib/emailTemplates";
import { generateQRDataURL } from "@/lib/qrcode";

export async function POST(req: NextRequest) {
  const { token, amountCents, note, customerName, customerEmail, items, totalPrice, tax } =
    await req.json();

  if (!token || !amountCents) {
    return NextResponse.json({ error: "Missing token or amount." }, { status: 400 });
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
      amount_money: { amount: amountCents, currency: "USD" },
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
  const grandTotal = amountCents / 100;

  // Send emails with QR code if Resend is configured
  if (process.env.RESEND_API_KEY && customerEmail) {
    const qrContent = [
      `ORDER: ${orderNumber}`,
      `The Playground @niederwald`,
      `Guest: ${customerName ?? "Guest"}`,
      ...(items ?? []).map(
        (i: { name: string; quantity: number }) => `${i.name} ×${i.quantity}`
      ),
      `Total: $${grandTotal.toFixed(2)}`,
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
          items: items ?? [],
          totalPrice: totalPrice ?? grandTotal * 0.9259,
          tax: tax ?? grandTotal * 0.0741,
          grandTotal,
          qrDataUrl,
        }),
      }),
      getResend().emails.send({
        from: FROM,
        to: NOTIFY_EMAIL,
        subject: `[Order] ${orderNumber} — ${customerName} — $${grandTotal.toFixed(2)}`,
        html: orderNotificationEmail({
          customerName: customerName ?? "Guest",
          customerEmail: customerEmail ?? "",
          orderNumber,
          items: items ?? [],
          grandTotal,
          paymentId,
        }),
      }),
    ]);
  }

  return NextResponse.json({ ok: true, paymentId, orderNumber, status: squareData.payment.status });
}
