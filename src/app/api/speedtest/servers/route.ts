import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export const SPEEDTEST_SERVERS = [
  {
    id: "kinshasa-core",
    name: "Kinshasa — Core POP Limete",
    city: "Kinshasa",
    country: "RD Congo",
    sponsor: "Liquid Intelligent Technologies",
    host: "cd-kin-core.liquidhome.tech",
    isDefault: true,
    flag: "🇨🇩",
  },
  {
    id: "kinshasa-gombe",
    name: "Kinshasa — Gateway Gombe",
    city: "Kinshasa",
    country: "RD Congo",
    sponsor: "Liquid Datacenter Gombe",
    host: "cd-kin-gombe.liquidhome.tech",
    isDefault: false,
    flag: "🇨🇩",
  },
  {
    id: "lubumbashi",
    name: "Lubumbashi — POP Katanga",
    city: "Lubumbashi",
    country: "RD Congo",
    sponsor: "Liquid Katanga Hub",
    host: "cd-fbm-pop.liquidhome.tech",
    isDefault: false,
    flag: "🇨🇩",
  },
  {
    id: "goma",
    name: "Goma — Edge Kivu",
    city: "Goma",
    country: "RD Congo",
    sponsor: "Liquid Kivu Backbone",
    host: "cd-gom-edge.liquidhome.tech",
    isDefault: false,
    flag: "🇨🇩",
  },
  {
    id: "johannesburg",
    name: "Johannesburg — Teraco JB1 IX",
    city: "Johannesburg",
    country: "Afrique du Sud",
    sponsor: "Liquid Africa Core IX",
    host: "za-jnb-ix.liquid.tech",
    isDefault: false,
    flag: "🇿🇦",
  },
];

export async function GET() {
  return NextResponse.json({
    ok: true,
    servers: SPEEDTEST_SERVERS,
  });
}
