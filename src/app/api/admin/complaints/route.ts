import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

const VALID = ["open", "in-progress", "resolved"];

export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, message: "Accès refusé." }, { status: 403 });
  }
  try {
    const body = await req.json();
    const id = (body?.id ?? "").toString();
    const status = (body?.status ?? "").toString();
    if (!VALID.includes(status)) {
      return NextResponse.json({ ok: false, message: "Statut invalide." }, { status: 400 });
    }
    const updated = await db.complaint.update({ where: { id }, data: { status } });
    return NextResponse.json({ ok: true, complaint: updated, message: `Ticket ${updated.ticket} → ${status}.` });
  } catch {
    return NextResponse.json({ ok: false, message: "Erreur serveur." }, { status: 500 });
  }
}
