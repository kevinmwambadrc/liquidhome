import { NextRequest, NextResponse } from "next/server";

// Simulated coverage database for Kinshasa communes
const COVERED_STREETS = [
  "avenue de la justice",
  "avenue du fleuve",
  "boulevard du 30 juin",
  "avenue kasa-vubu",
  "avenue de la liberation",
  "avenue mateba",
  "avenue triumphant",
  "avenue equateur",
  "avenue kasa\u00ef",
  "avenue des acacias",
  "avenue lukusa",
  "avenue bandundu",
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const street = (body?.street_address ?? "").toString().trim().toLowerCase();
    const houseNo = (body?.house_no ?? "").toString().trim();

    if (!street || !houseNo) {
      return NextResponse.json(
        { ok: false, message: "Adresse et numéro de maison requis." },
        { status: 400 }
      );
    }

    // Check if the street contains any of the covered street keywords
    const isCovered =
      COVERED_STREETS.some((s) => street.includes(s.split(" ").slice(-1)[0])) ||
      // Also randomly approve 70% of submissions to simulate broad coverage
      Math.random() > 0.3;

    return NextResponse.json({
      ok: true,
      available: isCovered,
      message: isCovered
        ? `Excellente nouvelle ! La fibre Liquid Home est disponible à "${street}, ${houseNo}". Nos techniciens peuvent installer votre connexion sous 5 jours.`
        : `Désolé, la fibre n'est pas encore disponible à "${street}, ${houseNo}". Contactez-nous au 4757 pour être informé de l'arrivée du réseau dans votre zone.`,
    });
  } catch {
    return NextResponse.json(
      { ok: false, message: "Erreur serveur. Réessayez plus tard." },
      { status: 500 }
    );
  }
}
