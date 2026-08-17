import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

const BLOCK_TYPES = ["paragraph", "heading", "image", "youtube", "audio", "button", "quote"];

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

function sanitizeBlocks(raw: unknown): unknown[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((b) => {
      const type = (b?.type ?? "").toString();
      if (!BLOCK_TYPES.includes(type)) return null;
      const block: Record<string, string> = { type };
      if (type === "paragraph" || type === "heading" || type === "quote") block.text = (b?.text ?? "").toString();
      if (type === "image") {
        block.url = (b?.url ?? "").toString();
        block.alt = (b?.alt ?? "").toString();
      }
      if (type === "youtube" || type === "audio") {
        block.url = (b?.url ?? "").toString();
        if (type === "youtube") block.title = (b?.title ?? "").toString();
      }
      if (type === "button") {
        block.label = (b?.label ?? "").toString();
        block.url = (b?.url ?? "").toString();
        block.variant = ["orange", "navy", "outline"].includes(b?.variant) ? b.variant : "orange";
      }
      if (["left", "center", "right"].includes(b?.align)) block.align = b.align;
      return block;
    })
    .filter(Boolean);
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ ok: false, message: "Accès refusé." }, { status: 403 });
  try {
    const b = await req.json();
    const title = (b?.title ?? "").toString().trim();
    if (!title) return NextResponse.json({ ok: false, message: "Titre requis." }, { status: 400 });
    const category = b?.category === "tuto" ? "tuto" : "info";
    const post = await db.post.create({
      data: {
        slug: `${slugify(title)}-${Date.now().toString(36).slice(-4)}`,
        title,
        category,
        excerpt: (b?.excerpt ?? "").toString(),
        coverImage: (b?.coverImage ?? "").toString() || null,
        content: JSON.stringify(sanitizeBlocks(b?.content)),
        published: b?.published !== false,
      },
    });
    return NextResponse.json({ ok: true, post, message: `Article « ${post.title} » publié.` });
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
    const existing = await db.post.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ ok: false, message: "Article introuvable." }, { status: 404 });

    const data: Record<string, unknown> = {};
    if (b?.title !== undefined) data.title = b.title.toString();
    if (b?.category !== undefined) data.category = b.category === "tuto" ? "tuto" : "info";
    if (b?.excerpt !== undefined) data.excerpt = b.excerpt.toString();
    if (b?.coverImage !== undefined) data.coverImage = b.coverImage.toString() || null;
    if (b?.published !== undefined) data.published = !!b.published;
    if (b?.content !== undefined) data.content = JSON.stringify(sanitizeBlocks(b.content));

    const post = await db.post.update({ where: { id }, data });
    return NextResponse.json({ ok: true, post: { ...post, content: JSON.parse(post.content) }, message: `Article « ${post.title} » mis à jour.` });
  } catch {
    return NextResponse.json({ ok: false, message: "Erreur serveur." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ ok: false, message: "Accès refusé." }, { status: 403 });
  const id = req.nextUrl.searchParams.get("id") ?? "";
  try {
    await db.post.delete({ where: { id } });
    return NextResponse.json({ ok: true, message: "Article supprimé." });
  } catch {
    return NextResponse.json({ ok: false, message: "Article introuvable." }, { status: 404 });
  }
}
