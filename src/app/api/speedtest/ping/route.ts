import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "197.234.218.42";

  return new NextResponse(
    JSON.stringify({
      ok: true,
      timestamp: Date.now(),
      server: "Liquid Home Kinshasa Core - Limete Datacenter",
      location: "Kinshasa, RDC",
      isp: "Liquid Intelligent Technologies RDC (AS30844)",
      ip,
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    }
  );
}
