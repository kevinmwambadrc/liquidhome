import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { refCode } from "@/lib/auth";
import { rateLimit, clientKey } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const rl = rateLimit(clientKey(req, "covreq"), 5, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ ok: false, message: "Trop de demandes. Réessayez plus tard." }, { status: 429 });
  }
  try {
    const body = await req.json();
    const name = (body?.name ?? "").toString().trim();
    const phone = (body?.phone ?? "").toString().trim();
    const email = (body?.email ?? "").toString().trim().toLowerCase();
    const address = (body?.address ?? "").toString().trim();
    const houseNo = (body?.house_no ?? "").toString().trim();
    const message = (body?.message ?? "").toString().trim();
    const commune = (body?.commune ?? "").toString() || null;
    const lat = Number.isFinite(Number(body?.lat)) ? Number(body?.lat) : null;
    const lng = Number.isFinite(Number(body?.lng)) ? Number(body?.lng) : null;

    if (!name || !phone || !address) {
      return NextResponse.json(
        { ok: false, message: "Nom, téléphone et adresse sont obligatoires." },
        { status: 400 }
      );
    }

    const ref = refCode("DCV");
    await db.coverageRequest.create({
      data: {
        ref,
        name,
        phone,
        email: email || null,
        address,
        houseNo: houseNo || null,
        commune,
        lat,
        lng,
        message: message || null,
      },
    });

    return NextResponse.json({
      ok: true,
      ref,
      message: `Merci ${name} ! Votre demande de couverture ${ref} est enregistrée. Notre équipe réseau étudie votre zone et vous rappellera au ${phone} sous 72h.`,
    });
  } catch {
    return NextResponse.json({ ok: false, message: "Erreur serveur." }, { status: 500 });
  }
}
