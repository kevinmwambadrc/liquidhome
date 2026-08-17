import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ ok: false, message: "Accès refusé." }, { status: 403 });

  const days = Math.min(90, Math.max(1, Number(req.nextUrl.searchParams.get("days") ?? 30)));
  const since = new Date();
  since.setDate(since.getDate() - days);

  const [events, consents, sessions, cookieConsents] = await Promise.all([
    db.trackingEvent.findMany({ where: { createdAt: { gte: since } }, orderBy: { createdAt: "desc" }, take: 2000 }),
    db.trackingEvent.findMany({ where: { kind: "consent" } }),
    db.trackingEvent.groupBy({ by: ["sid"], _count: { _all: true }, _max: { createdAt: true } }),
    db.cookieConsent.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
  ]);

  const accepted = consents.filter((c) => c.label === "accepted").length;
  const refused = consents.filter((c) => c.label === "refused").length;

  const pageviews = events.filter((e) => e.kind === "pageview");
  const byPath = new Map<string, number>();
  for (const pv of pageviews) {
    const p = pv.path ?? "/";
    byPath.set(p, (byPath.get(p) ?? 0) + 1);
  }
  const topPages = [...byPath.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12).map(([path, count]) => ({ path, count }));

  const clicks = events.filter((e) => e.kind === "click");
  const byLabel = new Map<string, number>();
  for (const c of clicks) {
    const l = c.label ?? "(élément)";
    byLabel.set(l, (byLabel.get(l) ?? 0) + 1);
  }
  const topClicks = [...byLabel.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12).map(([label, count]) => ({ label, count }));

  // Per-session journeys (last 40 active sessions)
  const sessionList = sessions
    .sort((a, b) => (b._max.createdAt?.getTime() ?? 0) - (a._max.createdAt?.getTime() ?? 0))
    .slice(0, 40)
    .map((s) => {
      const evts = events.filter((e) => e.sid === s.sid);
      return {
        sid: s.sid.slice(0, 8),
        events: s._count._all,
        lastAt: s._max.createdAt,
        journey: evts
          .slice(0, 15)
          .reverse()
          .map((e) => `${e.kind}:${e.path ?? e.label ?? ""}`)
          .join(" → "),
      };
    });

  return NextResponse.json({
    ok: true,
    stats: {
      events: events.length,
      pageviews: pageviews.length,
      clicks: clicks.length,
      sessions: sessions.length,
      accepted,
      refused,
    },
    topPages,
    topClicks,
    sessions: sessionList,
    cookieConsents,
    recent: events.slice(0, 60).map((e) => ({
      id: e.id,
      sid: e.sid.slice(0, 8),
      kind: e.kind,
      path: e.path,
      label: e.label,
      createdAt: e.createdAt,
    })),
  });
}
