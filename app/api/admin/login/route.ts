import { NextRequest, NextResponse } from "next/server";
import { sessionToken, COOKIE, verifyAdminPassword } from "@/lib/adminAuth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { password } = await req.json();

  if (!verifyAdminPassword(password)) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  const token = sessionToken();
  console.log("[auth] issuing token", {
    tokenLen: token.length,
    tokenPrefix: token.slice(0, 8),
    hasHashEnv: !!process.env.ADMIN_PASSWORD_HASH,
    hasPlainEnv: !!process.env.ADMIN_PASSWORD,
    hasSecret: !!process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_SECRET !== "dev-secret",
  });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "lax",
    path:     "/",
    maxAge:   60 * 60 * 24 * 30, // 30 days
  });
  return res;
}
