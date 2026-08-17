import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ ok: false, message: "Accès refusé." }, { status: 403 });
  try {
    const b = await req.json();
    const name = (b?.name ?? "").toString().trim();
    const price = Number(b?.price);
    if (!name || !Number.isFinite(price) || price < 0) {
      return NextResponse.json({ ok: false, message: "Nom et prix valides requis." }, { status: 400 });
    }
    const pkg = await db.package.create({
      data: {
        slug: `${slugify(name)}-${Date.now().toString(36).slice(-4)}`,
        name,
        price,
        speed: (b?.speed ?? "").toString(),
        volume: (b?.volume ?? "Illimités").toString(),
        features: JSON.stringify(Array.isArray(b?.features) ? b.features : []),
        badge: (b?.badge ?? "").toString() || null,
        highlighted: !!b?.highlighted,
        active: b?.active !== false,
        sortOrder: Number.isFinite(Number(b?.sortOrder)) ? Number(b.sortOrder) : 99,
      },
    });
    return NextResponse.json({ ok: true, pkg, message: `Forfait ${pkg.name} créé.` });
  } catch {
    return NextResponse.json({ ok: false, message: "Erreur serveur." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ ok: false, message: "Accès refusé." }, { status: 403 });
  try {
    const b = await req.json();
    const id = (b?.id ?? "").toString();
    const existing = await db.package.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ ok: false, message: "Forfait introuvable." }, { status: 404 });

    const data: Record<string, unknown> = {};
    if (b?.name !== undefined) data.name = b.name.toString();
    if (b?.price !== undefined) data.price = Number(b.price);
    if (b?.speed !== undefined) data.speed = b.speed.toString();
    if (b?.volume !== undefined) data.volume = b.volume.toString();
    if (b?.badge !== undefined) data.badge = b.badge.toString() || null;
    if (b?.highlighted !== undefined) data.highlighted = !!b.highlighted;
    if (b?.active !== undefined) data.active = !!b.active;
    if (b?.sortOrder !== undefined) data.sortOrder = Number(b.sortOrder);
    if (b?.features !== undefined) data.features = JSON.stringify(Array.isArray(b.features) ? b.features : []);

    const pkg = await db.package.update({ where: { id }, data });
    return NextResponse.json({ ok: true, pkg, message: `Forfait ${pkg.name} mis à jour.` });
  } catch {
    return NextResponse.json({ ok: false, message: "Erreur serveur." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ ok: false, message: "Accès refusé." }, { status: 403 });
  const id = req.nextUrl.searchParams.get("id") ?? "";
  try {
    // Keep history: deactivate instead of hard delete when orders reference it
    const pkg = await db.package.update({ where: { id }, data: { active: false } });
    return NextResponse.json({ ok: true, message: `Forfait ${pkg.name} désactivé (l'historique des commandes est conservé).` });
  } catch {
    return NextResponse.json({ ok: false, message: "Forfait introuvable." }, { status: 404 });
  }
}
