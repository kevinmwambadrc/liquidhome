import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

const CATEGORIES = ["router", "extender", "powerbank"];

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
    const category = (b?.category ?? "").toString();
    const price = Number(b?.price);
    if (!name || !CATEGORIES.includes(category) || !Number.isFinite(price)) {
      return NextResponse.json({ ok: false, message: "Nom, catégorie valide et prix requis." }, { status: 400 });
    }
    const eq = await db.equipment.create({
      data: {
        slug: `${slugify(name)}-${Date.now().toString(36).slice(-4)}`,
        name,
        category,
        price,
        description: (b?.description ?? "").toString(),
        imageUrl: (b?.imageUrl ?? "").toString() || null,
        active: b?.active !== false,
        sortOrder: Number.isFinite(Number(b?.sortOrder)) ? Number(b.sortOrder) : 99,
      },
    });
    return NextResponse.json({ ok: true, equipment: eq, message: `Équipement ${eq.name} créé.` });
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
    const existing = await db.equipment.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ ok: false, message: "Équipement introuvable." }, { status: 404 });

    const data: Record<string, unknown> = {};
    if (b?.name !== undefined) data.name = b.name.toString();
    if (b?.category !== undefined && CATEGORIES.includes(b.category)) data.category = b.category;
    if (b?.price !== undefined) data.price = Number(b.price);
    if (b?.description !== undefined) data.description = b.description.toString();
    if (b?.imageUrl !== undefined) data.imageUrl = b.imageUrl.toString() || null;
    if (b?.active !== undefined) data.active = !!b.active;
    if (b?.sortOrder !== undefined) data.sortOrder = Number(b.sortOrder);

    const eq = await db.equipment.update({ where: { id }, data });
    return NextResponse.json({ ok: true, equipment: eq, message: `Équipement ${eq.name} mis à jour.` });
  } catch {
    return NextResponse.json({ ok: false, message: "Erreur serveur." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ ok: false, message: "Accès refusé." }, { status: 403 });
  const id = req.nextUrl.searchParams.get("id") ?? "";
  try {
    await db.equipment.delete({ where: { id } });
    return NextResponse.json({ ok: true, message: "Équipement supprimé." });
  } catch {
    return NextResponse.json({ ok: false, message: "Équipement introuvable." }, { status: 404 });
  }
}
