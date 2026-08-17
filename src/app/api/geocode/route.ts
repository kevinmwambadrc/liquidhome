import { NextRequest, NextResponse } from "next/server";
import { rateLimit, clientKey } from "@/lib/rate-limit";

// Small TTL cache to stay polite with the free Nominatim quota
const geoCache = new Map<string, { at: number; results: unknown }>();
const GEO_TTL = 10 * 60 * 1000;

// Forward geocoding proxy (Nominatim / OpenStreetMap) so the browser avoids
// CORS and we can enforce Kinshasa-area biasing + a proper User-Agent.
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  const lat = req.nextUrl.searchParams.get("lat");
  const lng = req.nextUrl.searchParams.get("lng");
  if (!q || q.length < 3 || q.length > 200) {
    return NextResponse.json({ ok: true, results: [] });
  }

  const rl = rateLimit(clientKey(req, "geocode"), 30, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ ok: false, message: "Trop de recherches." }, { status: 429 });
  }

  const cached = geoCache.get(q);
  if (cached && Date.now() - cached.at < GEO_TTL) {
    return NextResponse.json({ ok: true, results: cached.results });
  }

  const googleApiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (googleApiKey) {
    try {
      const gUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(`${q}, RDC`)}&language=fr&components=country:CD&key=${googleApiKey}`;
      const gRes = await fetch(gUrl, { signal: AbortSignal.timeout(6000) });
      if (gRes.ok) {
        const gData = await gRes.json();
        if (gData.results && gData.results.length > 0) {
          const results = gData.results.map((r: any) => ({
            label: r.formatted_address,
            lat: r.geometry.location.lat,
            lng: r.geometry.location.lng,
          }));
          geoCache.set(q, { at: Date.now(), results });
          return NextResponse.json({ ok: true, results });
        }
      }
    } catch (e) {
      console.warn("Google geocode search fallback:", e);
    }
  }

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", q);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", "6");
  url.searchParams.set("countrycodes", "cd");
  if (lat && lng) {
    url.searchParams.set("viewbox", `${Number(lng) - 0.3},${Number(lat) - 0.3},${Number(lng) + 0.3},${Number(lat) + 0.3}`);
  }

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "LiquidHomeRDC-Website/1.0 (DRCfibre@liquid.tech)",
        "Accept-Language": "fr",
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`nominatim ${res.status}`);
    const data = (await res.json()) as Array<{
      display_name: string;
      lat: string;
      lon: string;
      type?: string;
    }>;
    const results = data.map((r) => ({
      label: r.display_name,
      lat: parseFloat(r.lat),
      lng: parseFloat(r.lon),
    }));
    geoCache.set(q, { at: Date.now(), results });
    return NextResponse.json({ ok: true, results });
  } catch {
    return NextResponse.json(
      { ok: false, message: "Service de localisation momentanément indisponible." },
      { status: 502 }
    );
  }
}
