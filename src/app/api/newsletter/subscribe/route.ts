import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = (body?.name ?? "").toString().trim();
    const email = (body?.email ?? "").toString().trim().toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { ok: false, message: "Adresse email invalide." },
        { status: 400 }
      );
    }

    await db.newsletterSubscriber.upsert({
      where: { email },
      update: { name: name || null },
      create: { email, name: name || null },
    });

    return NextResponse.json({
      ok: true,
      message: `Merci ${name || ""} de vous être abonné ! Vous recevrez bientôt nos actualités à ${email}.`.trim(),
    });
  } catch {
    return NextResponse.json(
      { ok: false, message: "Erreur serveur. Réessayez plus tard." },
      { status: 500 }
    );
  }
}
