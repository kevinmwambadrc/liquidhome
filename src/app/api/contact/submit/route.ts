import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const first_name = (body?.first_name ?? "").toString().trim();
    const last_name = (body?.last_name ?? "").toString().trim();
    const email = (body?.email ?? "").toString().trim().toLowerCase();
    const telephone = (body?.telephone ?? "").toString().trim();
    const city = (body?.city ?? "").toString().trim();
    const area_of_interest = (body?.area_of_interest ?? "home").toString();
    const requirements = (body?.requirements ?? "").toString().trim();

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

    // Simulate persistence / email sending
    return NextResponse.json({
      ok: true,
      message: `Merci ${first_name} ! Votre message a bien été envoyé. Notre équipe vous contactera au ${telephone} sous 24h.`,
    });
  } catch {
    return NextResponse.json(
      { ok: false, message: "Erreur serveur. Réessayez plus tard." },
      { status: 500 }
    );
  }
}
