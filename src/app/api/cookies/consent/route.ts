import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0].trim();
    if (first) return first;
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  const cfIp = req.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();
  return "197.234.218.42";
}

function parseUserAgent(ua: string) {
  let browser = "Navigateur Web";
  let os = "Système";
  let device = "Desktop";

  if (/chrome|crios/i.test(ua)) browser = "Google Chrome";
  else if (/firefox|fxios/i.test(ua)) browser = "Mozilla Firefox";
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = "Apple Safari";
  else if (/edg/i.test(ua)) browser = "Microsoft Edge";
  else if (/opera|opr/i.test(ua)) browser = "Opera";

  if (/android/i.test(ua)) {
    os = "Android";
    device = "Mobile";
  } else if (/iphone|ipad|ipod/i.test(ua)) {
    os = "iOS";
    device = /ipad/i.test(ua) ? "Tablet" : "Mobile";
  } else if (/windows/i.test(ua)) {
    os = "Windows";
  } else if (/macintosh|mac os x/i.test(ua)) {
    os = "macOS";
  } else if (/linux/i.test(ua)) {
    os = "Linux";
  }

  return { browser, os, device };
}

export async function GET(req: NextRequest) {
  const ip = getClientIp(req);
  const ua = req.headers.get("user-agent") || "";
  const clientInfo = parseUserAgent(ua);

  const consentCookie = req.cookies.get("lh_cookie_consent")?.value;
  let parsedConsent = null;
  if (consentCookie) {
    try {
      parsedConsent = JSON.parse(consentCookie);
    } catch {
      parsedConsent = null;
    }
  }

  // Get last recorded consent for this IP if available
  const lastConsent = await db.cookieConsent.findFirst({
    where: { ip },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    ok: true,
    ip,
    details: {
      ...clientInfo,
      city: "Kinshasa",
      country: "RDC (CD)",
      isp: "Liquid Intelligent Technologies RDC (AS30844)",
    },
    consent: parsedConsent || (lastConsent ? {
      necessary: lastConsent.necessary,
      functional: lastConsent.functional,
      analytics: lastConsent.analytics,
      marketing: lastConsent.marketing,
      updatedAt: lastConsent.createdAt,
    } : null),
  });
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const ua = req.headers.get("user-agent") || "";
    const clientInfo = parseUserAgent(ua);

    const body = await req.json();
    const necessary = true; // Always required for security & sessions
    const functional = Boolean(body?.functional);
    const analytics = Boolean(body?.analytics);
    const marketing = Boolean(body?.marketing);
    const source = (body?.source ?? "banner").toString().slice(0, 30);

    // Save consent record in Supabase DB
    const recorded = await db.cookieConsent.create({
      data: {
        ip,
        userAgent: ua.slice(0, 500),
        city: "Kinshasa",
        country: "CD",
        isp: "Liquid Intelligent Technologies RDC",
        necessary,
        functional,
        analytics,
        marketing,
        source,
      },
    });

    const consentPayload = {
      id: recorded.id,
      necessary,
      functional,
      analytics,
      marketing,
      timestamp: recorded.createdAt.toISOString(),
      ip,
    };

    const res = NextResponse.json({
      ok: true,
      message: "Préférences de cookies enregistrées avec succès.",
      consent: consentPayload,
      details: {
        ip,
        ...clientInfo,
        city: "Kinshasa",
        country: "RDC (CD)",
        isp: "Liquid Intelligent Technologies RDC",
      },
    });

    // Set cookie valid for 1 year
    res.cookies.set("lh_cookie_consent", JSON.stringify(consentPayload), {
      path: "/",
      maxAge: 365 * 24 * 60 * 60,
      sameSite: "lax",
      httpOnly: false,
    });

    return res;
  } catch (err) {
    console.error("Cookie consent error:", err);
    return NextResponse.json(
      { ok: false, message: "Erreur lors de l'enregistrement des cookies." },
      { status: 500 }
    );
  }
}
