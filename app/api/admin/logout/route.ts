import { NextRequest, NextResponse } from "next/server";
import { COOKIE } from "@/lib/adminAuth";

export async function POST(req: NextRequest) {
  const res = NextResponse.redirect(new URL("/admin-login", req.url));
  res.cookies.delete(COOKIE);
  return res;
}
