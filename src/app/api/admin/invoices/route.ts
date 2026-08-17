import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { sendEmail, paymentConfirmedEmail } from "@/lib/mailer";

export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, message: "Accès refusé." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const id = (body?.id ?? "").toString();
    const status = (body?.status ?? "paid").toString();
    const method = (body?.method ?? "Validation Manuelle Administrateur").toString();

    const invoice = await db.invoice.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!invoice) {
      return NextResponse.json({ ok: false, message: "Facture introuvable." }, { status: 404 });
    }

    const updated = await db.invoice.update({
      where: { id },
      data: { status, method },
    });

    if (status === "paid" && invoice.user?.email) {
      await sendEmail({
        to: invoice.user.email,
        subject: `Confirmation de paiement — Facture ${invoice.number}`,
        html: paymentConfirmedEmail({
          name: invoice.user.name || invoice.user.email,
          ref: invoice.number,
          amount: invoice.amount,
          paymentMethod: method,
          description: `Abonnement fibre optique (${invoice.period || "Période en cours"})`,
        }),
        kind: "payment_receipt",
      }).catch(() => {});
    }

    return NextResponse.json({
      ok: true,
      invoice: updated,
      message: `Facture ${updated.number} marquée comme "${status}" via ${method}. Email de confirmation envoyé au client.`,
    });
  } catch {
    return NextResponse.json({ ok: false, message: "Erreur serveur." }, { status: 500 });
  }
}
