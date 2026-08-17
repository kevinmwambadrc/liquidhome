import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const first_name = (body?.first_name ?? body?.firstName ?? "").toString().trim();
    const last_name = (body?.last_name ?? body?.lastName ?? "").toString().trim();
    const email = (body?.email ?? "").toString().trim().toLowerCase();
    const telephone = (body?.telephone ?? "").toString().trim();
    const city = (body?.city ?? "").toString().trim().slice(0, 120);
    const area_of_interest = (body?.area_of_interest ?? body?.areaOfInterest ?? "home").toString();
    const requirements = (body?.requirements ?? "").toString().trim().slice(0, 2000);

    if (!first_name || !last_name || !email || !telephone) {
      return NextResponse.json(
        { ok: false, message: "Veuillez remplir tous les champs obligatoires." },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { ok: false, message: "Adresse email invalide." },
        { status: 400 }
      );
    }

    const created = await db.contactMessage.create({
      data: {
        firstName: first_name,
        lastName: last_name,
        email,
        telephone,
        city: city || null,
        areaOfInterest: area_of_interest,
        requirements: requirements || null,
      },
    });

    return NextResponse.json({
      ok: true,
      id: created.id,
      message: `Merci ${first_name} ! Votre message a bien été envoyé. Notre équipe vous contactera au ${telephone} sous 24h.`,
    });
  } catch {
    return NextResponse.json(
      { ok: false, message: "Erreur serveur. Réessayez plus tard." },
      { status: 500 }
    );
  }
}
