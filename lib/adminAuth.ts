import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE = "admin_session";
const SCRYPT_KEYLEN = 64;
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export type AuthFailReason =
  | "nocookie"
  | "badformat"
  | "badsig"
  | "expired"
  | "nosecret";

function getSecret(): string | null {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret || secret === "dev-secret") {
    if (process.env.NODE_ENV === "production") return null;
    return "dev-secret";
  }
  return secret;
}

export function hashPassword(plaintext: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(plaintext, salt, SCRYPT_KEYLEN);
  return `${salt.toString("hex")}:${hash.toString("hex")}`;
}

function verifyScrypt(plaintext: string, stored: string): boolean {
  const [saltHex, hashHex] = stored.split(":");
  if (!saltHex || !hashHex) return false;
  let salt: Buffer;
  let expected: Buffer;
  try {
    salt = Buffer.from(saltHex, "hex");
    expected = Buffer.from(hashHex, "hex");
  } catch {
    return false;
  }
  if (expected.length !== SCRYPT_KEYLEN) return false;
  const actual = scryptSync(plaintext, salt, SCRYPT_KEYLEN);
  return timingSafeEqual(expected, actual);
}

export function verifyAdminPassword(attempt: string): boolean {
  if (!attempt) return false;
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (hash) return verifyScrypt(attempt, hash);

  const plain = process.env.ADMIN_PASSWORD;
  if (plain) {
    const a = Buffer.from(attempt);
    const b = Buffer.from(plain);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  }
  return false;
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

export function sessionToken(): string {
  const secret = getSecret();
  if (!secret) throw new Error("NEXTAUTH_SECRET must be set in production.");
  const exp = Date.now() + SESSION_TTL_MS;
  const payload = `v1.${exp}`;
  return `${payload}.${sign(payload, secret)}`;
}

/** Detailed auth check that returns the reason for failure. */
export async function checkAuth(): Promise<{ ok: true } | { ok: false; reason: AuthFailReason }> {
  const secret = getSecret();
  if (!secret) return { ok: false, reason: "nosecret" };

  const jar = await cookies();
  const value = jar.get(COOKIE)?.value;
  if (!value) return { ok: false, reason: "nocookie" };

  const lastDot = value.lastIndexOf(".");
  if (lastDot <= 0) return { ok: false, reason: "badformat" };
  const payload = value.slice(0, lastDot);
  const sig = value.slice(lastDot + 1);

  if (!payload.startsWith("v1.")) return { ok: false, reason: "badformat" };

  const expected = sign(payload, secret);
  if (sig.length !== expected.length) return { ok: false, reason: "badsig" };
  if (!timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex"))) {
    return { ok: false, reason: "badsig" };
  }

  const exp = Number(payload.slice(3));
  if (!Number.isFinite(exp) || exp < Date.now()) return { ok: false, reason: "expired" };

  return { ok: true };
}

export async function isAuthenticated(): Promise<boolean> {
  const r = await checkAuth();
  return r.ok;
}

/** Redirects to /admin-login?why=<reason> so the failure surface in the URL. */
export async function requireAuth() {
  const r = await checkAuth();
  if (!r.ok) redirect(`/admin-login?why=${r.reason}`);
}

export { COOKIE };
