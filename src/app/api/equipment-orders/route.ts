import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { refCode, getCurrentUser } from "@/lib/auth";
import { sendEmail, orderConfirmationEmail } from "@/lib/mailer";
import { rateLimit, clientKey } from "@/lib/rate-limit";

interface CartItem {
  slug: string;
  qty: number;
}

export async function POST(req: NextRequest) {
  const rl = rateLimit(clientKey(req, "eqorder"), 10, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ ok: false, message: "Trop de commandes. Réessayez plus tard." }, { status: 429 });
  }
  try {
    const body = await req.json();
    const items: CartItem[] = Array.isArray(body?.items) ? body.items : [];
    const buyerName = (body?.buyer_name ?? "").toString().trim();
    const buyerPhone = (body?.buyer_phone ?? "").toString().trim();
    const buyerEmail = (body?.buyer_email ?? "").toString().trim().toLowerCase();
    const deliveryAddress = (body?.delivery_address ?? "").toString().trim();

    if (items.length === 0 || !buyerName || !buyerPhone || !buyerEmail || !deliveryAddress) {
      return NextResponse.json(
        { ok: false, message: "Article(s), nom, téléphone, email et adresse de livraison requis." },
        { status: 400 }
      );
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyerEmail)) {
      return NextResponse.json({ ok: false, message: "Adresse email invalide." }, { status: 400 });
    }

    // Resolve each item against the live catalog (price is never trusted from the client)
    const resolved: { slug: string; name: string; unitPrice: number; qty: number }[] = [];
    for (const item of items) {
      const qty = Math.min(20, Math.max(1, Math.floor(Number(item.qty) || 1)));
      const eq = await db.equipment.findFirst({ where: { slug: (item.slug ?? "").toString(), active: true } });
      if (!eq) {
        return NextResponse.json({ ok: false, message: `Équipement inconnu : ${item.slug}` }, { status: 400 });
      }
      resolved.push({ slug: eq.slug, name: eq.name, unitPrice: eq.price, qty });
    }
    const total = resolved.reduce((sum, r) => sum + r.unitPrice * r.qty, 0);

    const user = await getCurrentUser();
    const ref = refCode("EQ");
    const order = await db.equipmentOrder.create({
      data: {
        ref,
        userId: user?.id ?? null,
        items: JSON.stringify(resolved),
        total,
        buyerName,
        buyerPhone,
        buyerEmail,
        deliveryAddress,
      },
    });

    await sendEmail({
      to: buyerEmail,
      subject: `Commande équipement ${order.ref} confirmée`,
      html: orderConfirmationEmail({ name: buyerName, ref: order.ref, items: resolved, total }),
      kind: "order",
    }).catch(() => {});

    return NextResponse.json({
      ok: true,
      order: { ref: order.ref, total: order.total },
      message: `Commande ${order.ref} confirmée (${total} USD). Un email de confirmation vous a été envoyé — notre équipe vous contactera pour la livraison.`,
    });
  } catch {
    return NextResponse.json({ ok: false, message: "Erreur serveur." }, { status: 500 });
  }
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ok: false, message: "Connexion requise." }, { status: 401 });
  }
  const orders = await db.equipmentOrder.findMany({
    where: { OR: [{ userId: user.id }, { buyerEmail: user.email }] },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({
    ok: true,
    orders: orders.map((o) => ({ ...o, items: JSON.parse(o.items) })),
  });
}
