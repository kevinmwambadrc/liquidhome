import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ok: false, message: "Connexion requise." }, { status: 401 });
  }
  try {
    const body = await req.json();
    const invoiceId = (body?.invoice_id ?? "").toString();
    const method = (body?.method ?? "mobile-money").toString();

    const invoice = await db.invoice.findUnique({ where: { id: invoiceId } });
    if (!invoice || invoice.userId !== user.id) {
      return NextResponse.json({ ok: false, message: "Facture introuvable." }, { status: 404 });
    }
    if (invoice.status === "paid") {
      return NextResponse.json({ ok: false, message: "Cette facture est déjà payée." }, { status: 400 });
    }

    await db.invoice.update({
      where: { id: invoice.id },
      data: { status: "paid", method },
    });

    return NextResponse.json({
      ok: true,
      message: `Paiement de ${invoice.amount} USD confirmé via ${method === "card" ? "carte bancaire" : "Mobile Money"}. Facture ${invoice.number} réglée.`,
    });
  } catch {
    return NextResponse.json({ ok: false, message: "Erreur serveur." }, { status: 500 });
  }
}
