import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { refCode, getCurrentUser } from "@/lib/auth";
import { sendEmail, topupEmail } from "@/lib/mailer";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ok: false, message: "Connexion requise." }, { status: 401 });
  }
  try {
    const body = await req.json();
    const packageSlug = (body?.package_slug ?? "").toString();
    const method = body?.method === "card" ? "card" : "mobile-money";

    const pkg = await db.package.findFirst({ where: { slug: packageSlug, active: true } });
    if (!pkg) {
      return NextResponse.json({ ok: false, message: "Forfait inconnu." }, { status: 400 });
    }

    // Billing period = next month after the current one
    const periodDate = new Date();
    periodDate.setMonth(periodDate.getMonth() + 1);
    const period = periodDate.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
    const dueAt = new Date();
    dueAt.setDate(dueAt.getDate() + 30);

    const invoice = await db.invoice.create({
      data: {
        number: refCode("INV"),
        userId: user.id,
        amount: pkg.price,
        status: "paid",
        method,
        period,
        dueAt,
      },
    });

    await sendEmail({
      to: user.email,
      subject: `Reçu de réabonnement ${invoice.number}`,
      html: topupEmail({
        name: user.name ?? user.email,
        amount: pkg.price,
        period,
        method,
      }),
      kind: "topup",
    }).catch(() => {});

    return NextResponse.json({
      ok: true,
      invoice: { number: invoice.number, amount: invoice.amount, period },
      message: `Réabonnement ${pkg.name} confirmé : ${pkg.price} USD payés via ${method === "card" ? "carte bancaire" : "Mobile Money"}. Facture ${invoice.number} (${period}).`,
    });
  } catch {
    return NextResponse.json({ ok: false, message: "Erreur serveur." }, { status: 500 });
  }
}
