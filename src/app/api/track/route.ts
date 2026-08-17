import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { rateLimit, clientKey } from "@/lib/rate-limit";

const VALID_KINDS = ["pageview", "click", "consent", "search", "signup-start", "order", "topup"];

export async function POST(req: NextRequest) {
  const rl = rateLimit(clientKey(req, "track"), 120, 60_000);
  if (!rl.ok) return NextResponse.json({ ok: true, throttled: true }, { status: 200 });

  try {
    const body = await req.json();
    const kind = (body?.kind ?? "").toString();
    if (!VALID_KINDS.includes(kind)) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    // Anonymous visitor session id
    let sid = req.cookies.get("lh_sid")?.value;
    const consent = req.cookies.get("lh_consent")?.value; // accepted | refused

    // Behavioral events require consent; consent events themselves are always kept
    if (kind !== "consent" && consent !== "accepted") {
      return NextResponse.json({ ok: true, skipped: true }, { status: 200 });
    }

    const user = await getCurrentUser().catch(() => null);

    if (!sid) {
      sid = crypto.randomUUID();
    }

    await db.trackingEvent.create({
      data: {
        sid,
        userId: user?.id ?? null,
        kind,
        path: (body?.path ?? "").toString().slice(0, 200) || null,
        label: (body?.label ?? "").toString().slice(0, 200) || null,
        meta: JSON.stringify({
          ref: req.headers.get("referer")?.slice(0, 200) ?? null,
          ua: req.headers.get("user-agent")?.slice(0, 200) ?? null,
        }),
      },
    });

    const res = NextResponse.json({ ok: true });
    if (!req.cookies.get("lh_sid")) {
      res.cookies.set("lh_sid", sid, {
        httpOnly: false,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 180,
      });
    }
    return res;
  } catch {
    return NextResponse.json({ ok: true }, { status: 200 });
  }
}
