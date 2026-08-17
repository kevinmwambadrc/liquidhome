import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser, hashPassword, verifyPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ok: false, message: "Connexion requise." }, { status: 401 });
  }
  try {
    const body = await req.json();
    const current = (body?.current_password ?? "").toString();
    const next = (body?.new_password ?? "").toString();

    if (!verifyPassword(current, user.passwordHash)) {
      return NextResponse.json(
        { ok: false, message: "Mot de passe actuel incorrect." },
        { status: 400 }
      );
    }
    if (next.length < 8 || !/[A-Za-z]/.test(next) || !/[0-9]/.test(next)) {
      return NextResponse.json(
        { ok: false, message: "Le nouveau mot de passe doit contenir au moins 8 caractères, lettres et chiffres." },
        { status: 400 }
      );
    }
    if (next === current) {
      return NextResponse.json(
        { ok: false, message: "Le nouveau mot de passe doit être différent." },
        { status: 400 }
      );
    }

    await db.user.update({
      where: { id: user.id },
      data: { passwordHash: hashPassword(next), mustResetPassword: false },
    });

    return NextResponse.json({
      ok: true,
      message: "Mot de passe réinitialisé. Bienvenue dans votre espace !",
    });
  } catch {
    return NextResponse.json({ ok: false, message: "Erreur serveur." }, { status: 500 });
  }
}
