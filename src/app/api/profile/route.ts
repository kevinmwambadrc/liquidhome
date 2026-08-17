import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function PUT(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ok: false, message: "Connexion requise." }, { status: 401 });
  }
  try {
    const body = await req.json();
    const name = (body?.name ?? "").toString().trim();
    const phone = (body?.phone ?? "").toString().trim();

    const updated = await db.user.update({
      where: { id: user.id },
      data: {
        name: name || user.name,
        phone: phone || user.phone,
      },
    });

    return NextResponse.json({
      ok: true,
      user: { name: updated.name, phone: updated.phone },
      message: "Profil mis à jour.",
    });
  } catch {
    return NextResponse.json({ ok: false, message: "Erreur serveur." }, { status: 500 });
  }
}
