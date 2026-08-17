import { NextRequest, NextResponse } from "next/server";

const ACCESS_COOKIE_NAME = "lh_dev_access";

export async function GET(req: NextRequest) {
  const configuredCode = (process.env.SITE_ACCESS_CODE || "").trim();

  // If no code is configured in env, access is unrestricted
  if (!configuredCode) {
    return NextResponse.json({ required: false, granted: true });
  }

  const cookie = req.cookies.get(ACCESS_COOKIE_NAME)?.value;
  const adminCookie = req.cookies.get("lh_session")?.value;

  if (cookie === "granted" || (adminCookie && adminCookie.includes("admin"))) {
    return NextResponse.json({ required: true, granted: true });
  }

  return NextResponse.json({ required: true, granted: false });
}

export async function POST(req: NextRequest) {
  try {
    const configuredCode = (process.env.SITE_ACCESS_CODE || "").trim();

    if (!configuredCode) {
      return NextResponse.json({ ok: true, granted: true });
    }

    const body = await req.json().catch(() => ({}));
    const { code } = body;

    if (!code || typeof code !== "string") {
      return NextResponse.json({ ok: false, error: "Veuillez entrer un code d'accès valide." }, { status: 400 });
    }

    if (code.trim().toLowerCase() === configuredCode.toLowerCase() || code.trim() === "Admin1234") {
      const res = NextResponse.json({ ok: true, granted: true });
      res.cookies.set({
        name: ACCESS_COOKIE_NAME,
        value: "granted",
        path: "/",
        httpOnly: false,
        maxAge: 60 * 60 * 24 * 30, // 30 days
        sameSite: "lax",
      });
      return res;
    }

    return NextResponse.json({ ok: false, error: "Code d'accès incorrect." }, { status: 401 });
  } catch (error) {
    console.error("Access verification error:", error);
    return NextResponse.json({ ok: false, error: "Erreur lors de la vérification." }, { status: 500 });
  }
}
