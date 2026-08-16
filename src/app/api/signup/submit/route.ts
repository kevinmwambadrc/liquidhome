import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const first_name = (body?.first_name ?? "").toString().trim();
    const last_name = (body?.last_name ?? "").toString().trim();
    const email = (body?.email ?? "").toString().trim().toLowerCase();
    const phone = (body?.phone ?? "").toString().trim();
    const package_id = (body?.package_id ?? "").toString();
    const street_address = (body?.street_address ?? "").toString();
    const house_no = (body?.house_no ?? "").toString();
    const installation_date = (body?.installation_date ?? "").toString();

    if (!first_name || !last_name || !email || !phone || !package_id) {
      return NextResponse.json(
        { ok: false, message: "Champs obligatoires manquants." },
        { status: 400 }
      );
    }

    // Simulate order creation
    const orderRef = `LH-${Date.now().toString(36).toUpperCase()}`;

    return NextResponse.json({
      ok: true,
      order_ref: orderRef,
      message: `Commande ${orderRef} enregistrée pour ${first_name} ${last_name}. Forfait ${package_id} à installer le ${installation_date || "à définir"} à ${street_address}, ${house_no}.`,
    });
  } catch {
    return NextResponse.json(
      { ok: false, message: "Erreur serveur. Réessayez plus tard." },
      { status: 500 }
    );
  }
}
