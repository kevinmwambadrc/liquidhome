import { NextRequest, NextResponse } from "next/server";
import { findZoneAt, COVERAGE_ZONES } from "@/lib/coverage";

// Streets known to be covered, used as a textual fallback when no
// GPS coordinates are supplied (header availability checker).
const COVERED_STREETS = [
  "avenue de la justice",
  "avenue du fleuve",
  "boulevard du 30 juin",
  "avenue kasa-vubu",
  "avenue de la liberation",
  "avenue mateba",
  "avenue triumphant",
  "avenue equateur",
  "avenue kasaï",
  "avenue des acacias",
  "avenue lukusa",
  "avenue bandundu",
];

const AVAILABLE_COMMUNES = COVERAGE_ZONES.filter((z) => z.status === "available").map((z) =>
  z.name.toLowerCase()
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const street = (body?.street_address ?? "").toString().trim();
    const houseNo = (body?.house_no ?? "").toString().trim();
    const lat = Number(body?.lat);
    const lng = Number(body?.lng);

    if (!street || !houseNo) {
      return NextResponse.json(
        { ok: false, message: "Adresse et numéro de maison requis." },
        { status: 400 }
      );
    }

    let zoneName: string | null = null;
    let available = false;

    if (Number.isFinite(lat) && Number.isFinite(lng) && (lat !== 0 || lng !== 0)) {
      // Authoritative check: point-in-polygon against the coverage zones
      const zone = findZoneAt(lat, lng);
      if (zone) {
        zoneName = zone.name;
        available = zone.status === "available";
      }
    }

    if (!zoneName) {
      // Textual fallback: covered streets then commune names
      const streetLower = street.toLowerCase();
      const streetHit = COVERED_STREETS.some((s) => streetLower.includes(s));
      const communeHit = AVAILABLE_COMMUNES.find((c) => streetLower.includes(c));
      if (streetHit || communeHit) {
        zoneName = communeHit ? communeHit.replace(/\b\w/g, (m) => m.toUpperCase()) : null;
        available = true;
      }
    }

    return NextResponse.json({
      ok: true,
      available,
      zone: zoneName,
      message: available
        ? `Excellente nouvelle ! La fibre Liquid Home est disponible à "${street}, ${houseNo}"${zoneName ? ` (${zoneName})` : ""}. Nos techniciens peuvent installer votre connexion sous 5 jours.`
        : `Désolé, la fibre n'est pas encore disponible à "${street}, ${houseNo}". Contactez-nous au 4757 pour être informé de l'arrivée du réseau dans votre zone.`,
    });
  } catch {
    return NextResponse.json(
      { ok: false, message: "Erreur serveur. Réessayez plus tard." },
      { status: 500 }
    );
  }
}
