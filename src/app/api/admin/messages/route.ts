import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, message: "Accès refusé." }, { status: 403 });
  }
  try {
    const body = await req.json();
    const id = (body?.id ?? "").toString();
    const handled = !!body?.handled;
    const updated = await db.contactMessage.update({ where: { id }, data: { handled } });
    return NextResponse.json({ ok: true, message: handled ? "Message marqué traité." : "Message réouvert." });
  } catch {
    return NextResponse.json({ ok: false, message: "Erreur serveur." }, { status: 500 });
  }
}
