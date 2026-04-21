import { NextRequest, NextResponse } from "next/server";
import { getResend, FROM, NOTIFY_EMAIL } from "@/lib/resend";
import { contactNotificationEmail, contactAutoReplyEmail } from "@/lib/emailTemplates";

export async function POST(req: NextRequest) {
  const { name, email, phone, subject, message } = await req.json();

  if (!name || !email || !subject || !message) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ ok: true });
  }

  await Promise.all([
    getResend().emails.send({
      from: FROM,
      to: NOTIFY_EMAIL,
      replyTo: email,
      subject: `[Contact] ${subject} — ${name}`,
      html: contactNotificationEmail({ name, email, phone, subject, message }),
    }),
    getResend().emails.send({
      from: FROM,
      to: email,
      subject: "We got your message! — The Playground @niederwald",
      html: contactAutoReplyEmail({ name, subject }),
    }),
  ]);

  return NextResponse.json({ ok: true });
}
