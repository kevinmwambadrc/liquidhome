import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, refCode } from "@/lib/auth";

const VALID = ["pending", "approved", "installed", "cancelled"];

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

    const order = await db.order.findUnique({ where: { id } });
    if (!order) {
      return NextResponse.json({ ok: false, message: "Commande introuvable." }, { status: 404 });
    }

    const updated = await db.order.update({ where: { id }, data: { status } });

    // First invoice is issued when the order is installed
    if (status === "installed" && order.status !== "installed") {
      let userId = order.userId;
      if (!userId) {
        const user =
          (await db.user.findUnique({ where: { email: order.email } })) ??
          (await db.user.create({
            data: {
              email: order.email,
              name: `${order.firstName} ${order.lastName}`,
              phone: order.phone,
              customerNo: `LH${Math.floor(100000 + Math.random() * 900000)}`,
            },
          }));
        userId = user.id;
        await db.order.update({ where: { id }, data: { userId } });
      }
      const existing = await db.invoice.findFirst({ where: { orderRef: order.ref } });
      if (!existing) {
        const period = new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
        const dueAt = new Date();
        dueAt.setDate(dueAt.getDate() + 15);
        await db.invoice.create({
          data: {
            number: refCode("INV"),
            userId,
            orderRef: order.ref,
            amount: order.packagePrice,
            period,
            dueAt,
          },
        });
      }
    }

    return NextResponse.json({
      ok: true,
      order: updated,
      message: `Commande ${updated.ref} → ${status}.`,
    });
  } catch {
    return NextResponse.json({ ok: false, message: "Erreur serveur." }, { status: 500 });
  }
}
