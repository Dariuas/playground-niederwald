import { createHash, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE = "admin_session";
const SCRYPT_KEYLEN = 64;

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

/** Constant-time compare a plaintext attempt against a stored "salt:hash". */
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
 * Prefers ADMIN_PASSWORD_HASH (scrypt). Falls back to ADMIN_PASSWORD plaintext
 * for backward compatibility — log a warning when that path is taken.
 */
export function verifyAdminPassword(attempt: string): boolean {
  if (!attempt) return false;
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (hash) return verifyScrypt(attempt, hash);

  const plain = process.env.ADMIN_PASSWORD;
  if (plain) {
    if (process.env.NODE_ENV === "production") {
      console.warn("Using legacy ADMIN_PASSWORD plaintext — set ADMIN_PASSWORD_HASH to upgrade.");
    }
    // Constant-time string compare
    const a = Buffer.from(attempt);
    const b = Buffer.from(plain);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  }
  return false;
}

/** Stable session token derived from the configured credential + secret. */
export function sessionToken(): string {
  const credentialMaterial =
    process.env.ADMIN_PASSWORD_HASH ?? process.env.ADMIN_PASSWORD ?? "";
  return createHash("sha256")
    .update(`${credentialMaterial}:${getSecret()}`)
    .digest("hex");
}

/** Verify the request cookie. Returns true if valid. */
export async function isAuthenticated(): Promise<boolean> {
  const jar = await cookies();
  const value = jar.get(COOKIE)?.value;
  if (!value) return false;
  const expected = sessionToken();
  if (value.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(value), Buffer.from(expected));
}

/** Call in server components / route handlers — redirects if not authed. */
export async function requireAuth() {
  if (!(await isAuthenticated())) redirect("/admin-login");
}

export { COOKIE };
