function esc(text: string): string {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function shell(content: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#fef9ee;font-family:Arial,Helvetica,sans-serif;color:#1c1917;">
  <div style="max-width:560px;margin:36px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <div style="background:#0f766e;padding:28px 40px;text-align:center;">
      <p style="color:#fbbf24;font-size:11px;letter-spacing:0.35em;text-transform:uppercase;margin:0 0 6px 0;">★ &nbsp; The Playground &nbsp; ★</p>
      <h1 style="color:#ffffff;margin:0;font-size:26px;font-weight:900;letter-spacing:-0.5px;">@niederwald</h1>
      <p style="color:#99f6e4;font-size:11px;margin:6px 0 0 0;letter-spacing:0.15em;">NIEDERWALD, TEXAS</p>
    </div>
    <div style="padding:32px 40px;">${content}</div>
    <div style="background:#f0fdf4;border-top:2px solid #d1fae5;padding:18px 40px;text-align:center;">
      <p style="color:#6b7280;font-size:11px;margin:0;">7400 Niederwald Strasse · Niederwald, TX 78640</p>
      <p style="color:#6b7280;font-size:11px;margin:4px 0 0;">(512) 537-7554 · info@playgroundniederwald.com</p>
      <p style="color:#9ca3af;font-size:10px;margin:8px 0 0;">Mon – Fri · 9 am – 9 pm</p>
    </div>
  </div>
</body>
</html>`;
}

function h2(text: string) {
  return `<h2 style="margin:0 0 6px;font-size:20px;font-weight:900;color:#1c1917;">${text}</h2>`;
}

function p(text: string, color = "#44403c") {
  return `<p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:${color};">${text}</p>`;
}

function labelRow(label: string, value: string) {
  return `<tr>
    <td style="padding:6px 12px 6px 0;font-size:12px;font-weight:bold;color:#9ca3af;text-transform:uppercase;letter-spacing:0.05em;white-space:nowrap;">${label}</td>
    <td style="padding:6px 0;font-size:14px;color:#1c1917;font-weight:600;">${value}</td>
  </tr>`;
}

function infoTable(rows: [string, string][]) {
  return `<table style="width:100%;border-collapse:collapse;background:#f9fafb;border:2px solid #e5e7eb;border-radius:12px;margin:16px 0;" cellpadding="0" cellspacing="0">
    <tbody>${rows.map(([l, v]) => labelRow(l, v)).join("")}</tbody>
  </table>`;
}

function qrBlock(dataUrl: string, caption: string) {
  return `<div style="text-align:center;margin:24px 0;">
    <p style="font-size:12px;font-weight:bold;color:#6b7280;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 12px;">Your QR Code</p>
    <img src="${dataUrl}" alt="QR Code" style="width:200px;height:200px;border:4px solid #d1fae5;border-radius:12px;display:block;margin:0 auto;" />
    <p style="font-size:11px;color:#9ca3af;margin:10px 0 0;">${caption}</p>
  </div>`;
}

function divider() {
  return `<hr style="border:none;border-top:2px solid #f3f4f6;margin:24px 0;" />`;
}

function cta(label: string, href: string) {
  return `<div style="text-align:center;margin:20px 0;">
    <a href="${href}" style="display:inline-block;background:#0f766e;color:#ffffff;font-weight:900;font-size:12px;text-decoration:none;padding:12px 28px;border-radius:12px;letter-spacing:0.08em;text-transform:uppercase;">${label}</a>
  </div>`;
}

// ─────────────────────────────────────────────────────────────
// ORDER CONFIRMATION (customer)
// ─────────────────────────────────────────────────────────────
export function orderConfirmationEmail(opts: {
  customerName: string;
  orderNumber: string;
  items: { name: string; quantity: number; price: number }[];
  totalPrice: number;
  tax: number;
  grandTotal: number;
  qrDataUrl: string;
}) {
  const itemRows = opts.items
    .map((i) => `${esc(i.name)} ×${i.quantity} — $${(i.price * i.quantity).toFixed(2)}`)
    .join("<br>");

  const content = `
    ${h2("Yeehaw! You're all set. 🤠")}
    ${p(`Hey <strong>${esc(opts.customerName)}</strong>, your order is confirmed. See y'all at the park!`)}
    ${infoTable([
      ["Order", esc(opts.orderNumber)],
      ["Items", itemRows],
      ["Subtotal", `$${opts.totalPrice.toFixed(2)}`],
      ["Tax (8%)", `$${opts.tax.toFixed(2)}`],
      ["Total Charged", `$${opts.grandTotal.toFixed(2)}`],
    ])}
    ${divider()}
    ${qrBlock(opts.qrDataUrl, "Show this at the gate for instant entry")}
    ${divider()}
    <div style="background:#fffbeb;border:2px solid #fde68a;border-radius:12px;padding:16px 20px;margin:16px 0;">
      <p style="font-size:12px;font-weight:900;color:#92400e;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 8px;">What to Bring</p>
      <p style="font-size:13px;color:#78350f;margin:0;line-height:1.6;">
        📱 This QR code (screenshot or leave the email open)<br>
        📍 7400 Niederwald Strasse, Niederwald TX 78640<br>
        🕐 Gates open at 9 am
      </p>
    </div>
    ${cta("Get Directions", "https://maps.google.com/?q=7400+Niederwald+Strasse+Niederwald+TX+78640")}
  `;
  return shell(content);
}

// ─────────────────────────────────────────────────────────────
// ORDER NOTIFICATION (park staff)
// ─────────────────────────────────────────────────────────────
export function orderNotificationEmail(opts: {
  customerName: string;
  customerEmail: string;
  orderNumber: string;
  items: { name: string; quantity: number; price: number }[];
  grandTotal: number;
  paymentId: string;
}) {
  const itemRows: [string, string][] = opts.items.map((i) => [
    esc(i.name),
    `×${i.quantity} — $${(i.price * i.quantity).toFixed(2)}`,
  ]);

  const content = `
    ${h2("New Order Received 🎟️")}
    ${infoTable([
      ["Order #", esc(opts.orderNumber)],
      ["Customer", esc(opts.customerName)],
      ["Email", esc(opts.customerEmail)],
      ...itemRows,
      ["Total", `$${opts.grandTotal.toFixed(2)}`],
      ["Square ID", esc(opts.paymentId)],
    ])}
  `;
  return shell(content);
}

// ─────────────────────────────────────────────────────────────
// PAVILION CONFIRMATION (customer)
// ─────────────────────────────────────────────────────────────
export function pavilionConfirmationEmail(opts: {
  customerName: string;
  pavilionName: string;
  date: string;
  time: string;
  duration: number;
  pavilionTotal?: number;
  addons?: { name: string; qty: number; price: number }[];
  total: number;
  qrDataUrl: string;
  reservationId: string;
  partySize?: number;
}) {
  const rows: [string, string][] = [
    ["Reservation ID", esc(opts.reservationId)],
    ["Pavilion",       esc(opts.pavilionName)],
    ["Date",           esc(opts.date)],
    ["Start Time",     esc(opts.time)],
    ["Duration",       `${opts.duration} hr${opts.duration !== 1 ? "s" : ""}`],
  ];
  if (opts.partySize) rows.push(["Party Size", `${opts.partySize} guests`]);
  if (opts.pavilionTotal !== undefined) {
    rows.push(["Pavilion", `$${opts.pavilionTotal.toFixed(2)}`]);
  }
  if (opts.addons && opts.addons.length > 0) {
    for (const a of opts.addons) {
      rows.push([
        `${esc(a.name)} ×${a.qty}`,
        `$${(a.price * a.qty).toFixed(2)}`,
      ]);
    }
  }
  rows.push(["Total Charged", `$${opts.total.toFixed(2)}`]);

  const childTickets = (opts.addons ?? []).find((a) => /child entry/i.test(a.name));
  const headsUp = childTickets
    ? `<div style="background:#ecfdf5;border:2px solid #a7f3d0;border-radius:12px;padding:16px 20px;margin:16px 0;">
        <p style="font-size:12px;font-weight:900;color:#047857;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 8px;">You're set</p>
        <p style="font-size:13px;color:#065f46;margin:0;line-height:1.6;">
          You bought <strong>${childTickets.qty} park entry ticket${childTickets.qty !== 1 ? "s" : ""}</strong> for kids ages 3–12. Adults and kids under 3 enter free. Bringing more kids? Add tickets at the gate.
        </p>
      </div>`
    : `<div style="background:#fffbeb;border:2px solid #fde68a;border-radius:12px;padding:16px 20px;margin:16px 0;">
        <p style="font-size:12px;font-weight:900;color:#92400e;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 8px;">Heads Up</p>
        <p style="font-size:13px;color:#78350f;margin:0;line-height:1.6;">
          Pavilion rental does <strong>not</strong> include park entry. Every kid ages 3–12 needs an entry ticket — adults and kids under 3 enter free. Pick up tickets at the gate if you didn't add any here.
        </p>
      </div>`;

  const content = `
    ${h2("Pavilion Reserved! 🏡")}
    ${p(`Hey <strong>${esc(opts.customerName)}</strong>, your pavilion is booked and payment has been processed. See y'all at the park!`)}
    ${infoTable(rows)}
    ${divider()}
    ${qrBlock(opts.qrDataUrl, "Show this when you arrive at your pavilion")}
    ${divider()}
    ${headsUp}
    ${p("Need to cancel or reschedule? Please call us at least 48 hours in advance.", "#6b7280")}
    ${cta("Get Directions", "https://maps.google.com/?q=7400+Niederwald+Strasse+Niederwald+TX+78640")}
  `;
  return shell(content);
}

// ─────────────────────────────────────────────────────────────
// PAVILION NOTIFICATION (park staff)
// ─────────────────────────────────────────────────────────────
export function pavilionNotificationEmail(opts: {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  pavilionName: string;
  date: string;
  time: string;
  duration: number;
  pavilionTotal?: number;
  addons?: { name: string; qty: number; price: number }[];
  total: number;
  reservationId: string;
  partySize?: number;
}) {
  const rows: [string, string][] = [
    ["Reservation ID", esc(opts.reservationId)],
    ["Pavilion",       esc(opts.pavilionName)],
    ["Date",           esc(opts.date)],
    ["Time",           esc(opts.time)],
    ["Duration",       `${opts.duration} hr${opts.duration !== 1 ? "s" : ""}`],
  ];
  if (opts.partySize) rows.push(["Party Size", `${opts.partySize} guests`]);
  if (opts.pavilionTotal !== undefined) {
    rows.push(["Pavilion", `$${opts.pavilionTotal.toFixed(2)}`]);
  }
  if (opts.addons && opts.addons.length > 0) {
    for (const a of opts.addons) {
      rows.push([
        `${esc(a.name)} ×${a.qty}`,
        `$${(a.price * a.qty).toFixed(2)}`,
      ]);
    }
  }
  rows.push(
    ["Charged",  `$${opts.total.toFixed(2)}`],
    ["Customer", esc(opts.customerName)],
    ["Email",    esc(opts.customerEmail)],
    ["Phone",    esc(opts.customerPhone || "—")],
  );
  const content = `
    ${h2("New Pavilion Booking 🏡")}
    ${infoTable(rows)}
  `;
  return shell(content);
}

// ─────────────────────────────────────────────────────────────
// CONTACT FORM NOTIFICATION (park staff)
// ─────────────────────────────────────────────────────────────
export function contactNotificationEmail(opts: {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}) {
  const content = `
    ${h2("New Contact Form Submission 📬")}
    ${infoTable([
      ["From", esc(opts.name)],
      ["Email", esc(opts.email)],
      ["Phone", esc(opts.phone || "—")],
      ["Subject", esc(opts.subject)],
    ])}
    <div style="background:#f9fafb;border:2px solid #e5e7eb;border-radius:12px;padding:16px 20px;margin:16px 0;">
      <p style="font-size:12px;font-weight:bold;color:#9ca3af;text-transform:uppercase;letter-spacing:0.05em;margin:0 0 8px;">Message</p>
      <p style="font-size:14px;color:#1c1917;margin:0;line-height:1.6;white-space:pre-wrap;">${esc(opts.message)}</p>
    </div>
    <p style="font-size:12px;color:#9ca3af;margin:0;">Reply directly to this email to respond to ${esc(opts.name)}.</p>
  `;
  return shell(content);
}

// ─────────────────────────────────────────────────────────────
// CONTACT FORM AUTO-REPLY (customer)
// ─────────────────────────────────────────────────────────────
export function contactAutoReplyEmail(opts: { name: string; subject: string }) {
  const content = `
    ${h2(`Hey ${esc(opts.name)}! 👋`)}
    ${p("Thanks for reaching out — we got your message and will holler back real soon.")}
    ${infoTable([["Topic", esc(opts.subject)]])}
    ${divider()}
    ${p("In the meantime, feel free to give us a call:", "#6b7280")}
    <p style="text-align:center;font-size:22px;font-weight:900;color:#0f766e;margin:0 0 24px;">
      <a href="tel:+15125377554" style="color:#0f766e;text-decoration:none;">(512) 537-7554</a>
    </p>
    ${cta("Explore the Park", "https://playgroundniederwald.com")}
  `;
  return shell(content);
}
