import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword, createSession } from "@/lib/auth";
import { rateLimit, clientKey } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const rl = rateLimit(clientKey(req, "login"), 8, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { ok: false, message: `Trop de tentatives. Réessayez dans ${rl.retryAfter}s.` },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
    );
  }
  try {
    const body = await req.json();
    const email = (body?.email ?? "").toString().trim().toLowerCase();
    const password = (body?.password ?? "").toString();

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, message: "Email et mot de passe requis." },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({ where: { email } });
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json(
        { ok: false, message: "Identifiants incorrects. Vérifiez votre email et mot de passe." },
        { status: 401 }
      );
    }

    await createSession(user.id);
    return NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        mustResetPassword: user.mustResetPassword,
      },
      mustResetPassword: user.mustResetPassword,
      message: `Bienvenue ${user.name || user.email} !`,
    });
  } catch {
    return NextResponse.json({ ok: false, message: "Erreur serveur. Réessayez." }, { status: 500 });
  }
}
