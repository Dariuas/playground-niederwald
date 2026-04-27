import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE = "admin_session";
const SCRYPT_KEYLEN = 64;
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function getSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret || secret === "dev-secret") {
    if (process.env.NODE_ENV === "production") {
      throw new Error("NEXTAUTH_SECRET must be set in production.");
    }
    return "dev-secret";
  }
  return secret;
}

/** Hash a plaintext password using scrypt. Format: "salt:hash" (hex). */
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

/**
 * Verify a password attempt against the configured admin credential.
 * Prefers ADMIN_PASSWORD_HASH (scrypt). Falls back to ADMIN_PASSWORD plaintext.
 */
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

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("hex");
}

/** Issue a fresh session cookie value: "v1.<expMs>.<hmac>". */
export function sessionToken(): string {
  const exp = Date.now() + SESSION_TTL_MS;
  const payload = `v1.${exp}`;
  return `${payload}.${sign(payload)}`;
}

/** Verify the request cookie. Returns true if valid and unexpired. */
export async function isAuthenticated(): Promise<boolean> {
  const jar = await cookies();
  const value = jar.get(COOKIE)?.value;
  if (!value) return false;

  const lastDot = value.lastIndexOf(".");
  if (lastDot <= 0) return false;
  const payload = value.slice(0, lastDot);
  const sig = value.slice(lastDot + 1);

  if (!payload.startsWith("v1.")) return false;

  const expected = sign(payload);
  if (sig.length !== expected.length) return false;
  if (!timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex"))) return false;

  const exp = Number(payload.slice(3));
  if (!Number.isFinite(exp) || exp < Date.now()) return false;

  return true;
}

/** Call in server components / route handlers — redirects if not authed. */
export async function requireAuth() {
  if (!(await isAuthenticated())) redirect("/admin-login");
}

export { COOKIE };
