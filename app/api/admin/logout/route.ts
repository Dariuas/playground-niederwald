import { NextResponse } from "next/server";
import { COOKIE } from "@/lib/adminAuth";

export async function POST() {
  const res = NextResponse.redirect(
    new URL("/admin/login", process.env.NEXTAUTH_URL ?? "http://localhost:3000")
  );
  res.cookies.delete(COOKIE);
  return res;
}
