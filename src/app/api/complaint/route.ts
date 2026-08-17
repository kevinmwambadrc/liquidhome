import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { refCode, getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = (body?.name ?? "").toString().trim();
    const email = (body?.email ?? "").toString().trim().toLowerCase();
    const telephone = (body?.telephone ?? "").toString().trim();
    const message = (body?.message ?? "").toString().trim().slice(0, 2000);

    if (!name || !email || !telephone || !message) {
      return NextResponse.json(
        { ok: false, message: "Tous les champs sont obligatoires." },
        { status: 400 }
      );
    }

    const user = await getCurrentUser();
    const ticket = refCode("TKT");

    const created = await db.complaint.create({
      data: {
        ticket,
        userId: user?.id ?? null,
        name,
        email,
        telephone,
        message,
      },
    });

    return NextResponse.json({
      ok: true,
      id: created.id,
      ticket,
      message: `Votre plainte a été enregistrée sous le ticket ${ticket}. Notre équipe de résolution vous contactera au ${telephone} sous 48h.`,
    });
  } catch {
    return NextResponse.json(
      { ok: false, message: "Erreur serveur. Réessayez plus tard." },
      { status: 500 }
    );
  }
}
