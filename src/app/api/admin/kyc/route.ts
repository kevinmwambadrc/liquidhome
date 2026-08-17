import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

const VALID = ["pending", "approved", "rejected"];

export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ ok: false, message: "Accès refusé." }, { status: 403 });
  try {
    const b = await req.json();
    const userId = (b?.user_id ?? "").toString();
    const status = (b?.status ?? "").toString();
    if (!VALID.includes(status)) {
      return NextResponse.json({ ok: false, message: "Statut invalide." }, { status: 400 });
    }
    const user = await db.user.update({
      where: { id: userId },
      data: { kycStatus: status, kycReviewedAt: new Date() },
    });
    return NextResponse.json({
      ok: true,
      message:
        status === "approved"
          ? `Identité de ${user.name ?? user.email} vérifiée ✓`
          : status === "rejected"
            ? `Identité de ${user.name ?? user.email} rejetée.`
            : `Vérification remise en attente.`,
    });
  } catch {
    return NextResponse.json({ ok: false, message: "Utilisateur introuvable." }, { status: 404 });
  }
}
