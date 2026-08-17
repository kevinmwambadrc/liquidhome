import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

const VALID = ["new", "contacted", "covered"];

export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ ok: false, message: "Accès refusé." }, { status: 403 });
  try {
    const b = await req.json();
    const id = (b?.id ?? "").toString();
    const status = (b?.status ?? "").toString();
    if (!VALID.includes(status)) {
      return NextResponse.json({ ok: false, message: "Statut invalide." }, { status: 400 });
    }
    const cr = await db.coverageRequest.update({ where: { id }, data: { status } });
    return NextResponse.json({ ok: true, message: `Demande ${cr.ref} → ${status}.` });
  } catch {
    return NextResponse.json({ ok: false, message: "Erreur serveur." }, { status: 500 });
  }
}
