import { NextRequest, NextResponse } from "next/server";
import { findZoneAt } from "@/lib/coverage";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const latStr = url.searchParams.get("lat");
  const lngStr = url.searchParams.get("lng");

  if (!latStr || !lngStr) {
    return NextResponse.json(
      { ok: false, message: "Coordonnées lat et lng requises." },
      { status: 400 }
    );
  }

  const lat = parseFloat(latStr);
  const lng = parseFloat(lngStr);

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json(
      { ok: false, message: "Coordonnées GPS invalides." },
      { status: 400 }
    );
  }

  const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
  const zone = findZoneAt(lat, lng);

  let street = "";
  let houseNo = "";
  let commune = zone?.commune || zone?.name || "";
  let city = "Kinshasa";
  let formattedAddress = "";

  const googleApiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  // 1. Try Google Maps Geocoding API if key is configured
  if (googleApiKey) {
    try {
      const gRes = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&language=fr&key=${googleApiKey}`,
        { signal: AbortSignal.timeout(6000) }
      );
      if (gRes.ok) {
        const gData = await gRes.json();
        if (gData.results && gData.results.length > 0) {
          const first = gData.results[0];
          formattedAddress = first.formatted_address || "";

          for (const comp of first.address_components || []) {
            const types = comp.types || [];
            if (types.includes("route")) {
              street = comp.long_name;
            } else if (types.includes("street_number")) {
              houseNo = comp.long_name;
            } else if (types.includes("sublocality") || types.includes("neighborhood") || types.includes("administrative_area_level_3")) {
              if (!commune) commune = comp.long_name;
            } else if (types.includes("locality") || types.includes("administrative_area_level_2")) {
              city = comp.long_name;
            }
          }
        }
      }
    } catch (err) {
      console.warn("Google reverse geocoding fallback triggered:", err);
    }
  }

  // 2. Fallback to OpenStreetMap Reverse Geocode if Google didn't return street
  if (!street) {
    try {
      const osmRes = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=jsonv2&addressdetails=1&zoom=18`,
        {
          headers: {
            "User-Agent": "LiquidHomeRDC-ReverseGeocoder/1.0 (DRCfibre@liquid.tech)",
            "Accept-Language": "fr",
          },
          signal: AbortSignal.timeout(5000),
        }
      );

      if (osmRes.ok) {
        const osmData = await osmRes.json();
        const addr = osmData.address || {};

        street =
          addr.road ||
          addr.pedestrian ||
          addr.suburb ||
          addr.neighbourhood ||
          addr.quarter ||
          "";

        houseNo = addr.house_number || addr.house_name || "";
        if (!commune) {
          commune =
            addr.suburb ||
            addr.neighbourhood ||
            addr.city_district ||
            addr.quarter ||
            (zone ? zone.name : "Kinshasa");
        }
        if (addr.city || addr.town) {
          city = addr.city || addr.town || "Kinshasa";
        }
        formattedAddress = osmData.display_name || "";
      }
    } catch (err) {
      console.warn("OSM reverse geocoding fallback note:", err);
    }
  }

  // 3. Smart local Kinshasa fallback if street name was still not resolved
  if (!street) {
    if (zone) {
      street = `Avenue Principale (${zone.name})`;
    } else {
      street = "Avenue / Rue Kinshasa";
    }
  }

  return NextResponse.json({
    ok: true,
    street,
    houseNo,
    commune,
    city,
    formattedAddress: formattedAddress || `${street}${houseNo ? ` N° ${houseNo}` : ""}, ${commune}, ${city}`,
    googleMapsUrl,
    lat,
    lng,
    zone: zone ? zone.name : null,
    available: zone ? zone.status === "available" : false,
  });
}
