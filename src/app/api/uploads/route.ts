import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { rateLimit, clientKey } from "@/lib/rate-limit";

// Public uploads (KYC identity documents): images + PDF, 8 MB max.
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const MAX_BYTES = 8 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const rl = rateLimit(clientKey(req, "upload"), 10, 10 * 60_000);
  if (!rl.ok) {
    return NextResponse.json({ ok: false, message: "Trop de téléversements. Réessayez plus tard." }, { status: 429 });
  }
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, message: "Aucun fichier reçu." }, { status: 400 });
    }
    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json(
        { ok: false, message: "Format non autorisé (JPG, PNG, WebP ou PDF uniquement)." },
        { status: 400 }
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ ok: false, message: "Fichier trop lourd (max 8 Mo)." }, { status: 400 });
    }

    const ext = (file.name.split(".").pop() ?? "bin").toLowerCase().replace(/[^a-z0-9]/g, "");
    const safe = `kyc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const dir = path.join(process.cwd(), "public", "uploads", "kyc");
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, safe), Buffer.from(await file.arrayBuffer()));

    return NextResponse.json({ ok: true, url: `/uploads/kyc/${safe}` });
  } catch {
    return NextResponse.json({ ok: false, message: "Erreur serveur pendant le téléversement." }, { status: 500 });
  }
}
