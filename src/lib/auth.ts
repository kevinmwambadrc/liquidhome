import { randomBytes, scryptSync, timingSafeEqual, createHash } from "crypto";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

export const SESSION_COOKIE = "lh_session";
const SESSION_DAYS = 7;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string | null): boolean {
  if (!stored) return false;
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

export function newToken(): string {
  return randomBytes(32).toString("hex");
}

/** Readable temporary password: letters+digits, no ambiguous chars. */
export function generateTempPassword(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  const bytes = randomBytes(10);
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

export function refCode(prefix: string): string {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = createHash("md5")
    .update(randomBytes(8))
    .digest("hex")
    .slice(0, 4)
    .toUpperCase();
  return `${prefix}-${stamp}-${rand}`;
}

export async function createSession(userId: string): Promise<string> {
  const token = newToken();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await db.session.create({ data: { token, userId, expiresAt } });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
  return token;
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.session.deleteMany({ where: { token } });
  }
  jar.delete(SESSION_COOKIE);
}

export async function getCurrentUser() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await db.session.findUnique({
    where: { token },
    include: { user: true },
  });
  if (!session || session.expiresAt < new Date()) {
    if (session) await db.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }
  return session.user;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) return null;
  return user;
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return null;
  return user;
}

export async function syncUserToSupabaseAuth(
  email: string,
  name?: string | null,
  role: string = "client",
  password?: string | null
) {
  try {
    const rawUserMeta = JSON.stringify({ name: name || email, role });
    const rawAppMeta = JSON.stringify({ provider: "email", providers: ["email"] });
    if (password) {
      await db.$executeRawUnsafe(
        `
        INSERT INTO auth.users (
          instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin
        )
        VALUES (
          '00000000-0000-0000-0000-000000000000',
          gen_random_uuid(),
          'authenticated',
          'authenticated',
          $1,
          crypt($2, gen_salt('bf')),
          NOW(),
          NOW(),
          NOW(),
          $3::jsonb,
          $4::jsonb,
          false
        )
        ON CONFLICT (email) DO UPDATE SET
          raw_user_meta_data = $4::jsonb,
          updated_at = NOW();
      `,
        email,
        password,
        rawAppMeta,
        rawUserMeta
      );
    }
  } catch (err) {
    console.error("Supabase Auth sync note:", err);
  }
}

