import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { requireAdmin } from "@/lib/auth";

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif", "audio/mpeg", "audio/mp4", "audio/ogg", "audio/wav"];
const MAX_BYTES = 12 * 1024 * 1024; // 12 MB

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ ok: false, message: "Accès refusé." }, { status: 403 });
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, message: "Aucun fichier reçu." }, { status: 400 });
    }
    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json({ ok: false, message: `Type non autorisé (${file.type}).` }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ ok: false, message: "Fichier trop lourd (max 12 Mo)." }, { status: 400 });
    }

    const ext = (file.name.split(".").pop() ?? "bin").toLowerCase().replace(/[^a-z0-9]/g, "");
    const stamp = Date.now().toString(36);
    const safe = `${stamp}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const dir = path.join(process.cwd(), "public", "uploads");
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, safe), Buffer.from(await file.arrayBuffer()));

    return NextResponse.json({ ok: true, url: `/uploads/${safe}`, message: "Fichier téléversé." });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, message: "Erreur serveur pendant le téléversement." }, { status: 500 });
  }
}
