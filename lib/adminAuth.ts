import { createHash } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE = "admin_session";

/** Derives a session token from the password + server secret. */
export function sessionToken(): string {
  const secret   = process.env.NEXTAUTH_SECRET  ?? "dev-secret";
  const password = process.env.ADMIN_PASSWORD   ?? "";
  return createHash("sha256").update(`${password}:${secret}`).digest("hex");
}

/** Verify the request cookie. Returns true if valid. */
export async function isAuthenticated(): Promise<boolean> {
  const jar   = await cookies();
  const value = jar.get(COOKIE)?.value;
  return value === sessionToken();
}

/** Call in server components / route handlers — redirects if not authed. */
export async function requireAuth() {
  if (!(await isAuthenticated())) redirect("/admin-login");
}

export { COOKIE };
