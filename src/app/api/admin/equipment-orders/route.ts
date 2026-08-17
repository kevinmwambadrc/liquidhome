import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

const VALID = ["pending", "confirmed", "delivered", "cancelled"];

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
    const order = await db.equipmentOrder.update({ where: { id }, data: { status } });
    return NextResponse.json({ ok: true, message: `Commande ${order.ref} → ${status}.` });
  } catch {
    return NextResponse.json({ ok: false, message: "Commande introuvable." }, { status: 404 });
  }
}
