import { NextRequest, NextResponse } from "next/server";

const COOKIE = "admin_session";

async function sessionToken(): Promise<string> {
  const secret   = process.env.NEXTAUTH_SECRET ?? "dev-secret";
  const password = process.env.ADMIN_PASSWORD  ?? "";
  const data     = new TextEncoder().encode(`${password}:${secret}`);
  const hashBuf  = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/admin/login") return NextResponse.next();

  const cookie = req.cookies.get(COOKIE)?.value;
  const token  = await sessionToken();
  const valid  = cookie === token;

  if (!valid) {
    const loginUrl = new URL("/admin/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
