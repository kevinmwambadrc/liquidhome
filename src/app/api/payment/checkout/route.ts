import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { refCode, getCurrentUser } from "@/lib/auth";
import { buildMaishaPayCheckoutFields, getMaishaPayConfig } from "@/lib/maishapay";
import { rateLimit, clientKey } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const rl = rateLimit(clientKey(req, "payment-checkout"), 15, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { ok: false, message: "Trop de requêtes de paiement. Veuillez patienter." },
      { status: 429 }
    );
  }

  try {
    const user = await getCurrentUser();
    const body = await req.json();
    const type = (body?.type ?? "invoice").toString(); // invoice | topup | equipment
    const config = getMaishaPayConfig();

    // Determine the base app URL
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "localhost:3000";
    const proto = req.headers.get("x-forwarded-proto") || "http";
    const origin = `${proto}://${host}`;

    let amount = 0;
    let targetId = "";
    let currency: "USD" | "CDF" = "USD";
    let callbackParams = "";

    const txRef = refCode("TX");

    if (type === "invoice") {
      if (!user) {
        return NextResponse.json({ ok: false, message: "Connexion requise." }, { status: 401 });
      }
      const invoiceId = (body?.invoice_id ?? "").toString();
      const invoice = await db.invoice.findUnique({ where: { id: invoiceId } });
      if (!invoice || invoice.userId !== user.id) {
        return NextResponse.json({ ok: false, message: "Facture introuvable." }, { status: 404 });
      }
      if (invoice.status === "paid") {
        return NextResponse.json({ ok: false, message: "Cette facture est déjà payée." }, { status: 400 });
      }

      amount = invoice.amount;
      targetId = invoice.id;
      callbackParams = `type=invoice&invoice_id=${encodeURIComponent(invoice.id)}&tx_ref=${txRef}`;
    } else if (type === "topup") {
      if (!user) {
        return NextResponse.json({ ok: false, message: "Connexion requise." }, { status: 401 });
      }
      const packageSlug = (body?.package_slug ?? "").toString();
      const pkg = await db.package.findFirst({ where: { slug: packageSlug, active: true } });
      if (!pkg) {
        return NextResponse.json({ ok: false, message: "Forfait inconnu ou inactif." }, { status: 400 });
      }

      amount = pkg.price;
      targetId = pkg.slug;
      callbackParams = `type=topup&package_slug=${encodeURIComponent(pkg.slug)}&user_id=${user.id}&tx_ref=${txRef}`;
    } else if (type === "equipment") {
      const orderRef = (body?.order_ref ?? "").toString();
      const eqOrder = await db.equipmentOrder.findUnique({ where: { ref: orderRef } });
      if (!eqOrder) {
        return NextResponse.json({ ok: false, message: "Commande d'équipement introuvable." }, { status: 404 });
      }
      if (eqOrder.paymentStatus === "paid") {
        return NextResponse.json({ ok: false, message: "Cette commande est déjà payée." }, { status: 400 });
      }

      amount = eqOrder.total;
      targetId = eqOrder.ref;
      callbackParams = `type=equipment&order_ref=${encodeURIComponent(eqOrder.ref)}&tx_ref=${txRef}`;
    } else {
      return NextResponse.json({ ok: false, message: "Type de paiement non reconnu." }, { status: 400 });
    }

    // Record initial transaction in DB
    await db.paymentTransaction.create({
      data: {
        ref: txRef,
        gateway: "maishapay",
        gatewayMode: config.gatewayMode === "1" ? "live" : "sandbox",
        type,
        targetId,
        userId: user?.id ?? null,
        amount,
        currency,
        status: "pending",
        description: `Paiement MaishaPay ${type} (${amount} ${currency})`,
      },
    });

    const callbackUrl = `${origin}/api/payment/callback?${callbackParams}`;

    const { actionUrl, fields } = buildMaishaPayCheckoutFields(
      {
        montant: amount,
        devise: currency,
        callbackUrl,
      },
      config
    );

    return NextResponse.json({
      ok: true,
      actionUrl,
      fields,
      txRef,
      amount,
      currency,
    });
  } catch (error) {
    console.error("Payment checkout error:", error);
    return NextResponse.json({ ok: false, message: "Erreur lors de l'initialisation du paiement." }, { status: 500 });
  }
}
