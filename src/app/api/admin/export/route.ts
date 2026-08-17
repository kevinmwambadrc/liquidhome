import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

function csvEscape(v: unknown): string {
  const s = String(v ?? "");
  return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function toCsv(rows: (string | number | null | undefined)[][]): string {
  // BOM so Excel opens accents correctly
  return "\uFEFF" + rows.map((r) => r.map(csvEscape).join(";")).join("\r\n");
}

export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ ok: false, message: "Accès refusé." }, { status: 403 });

  const scope = req.nextUrl.searchParams.get("scope") ?? "sales";
  const stamp = new Date().toISOString().slice(0, 10);

  if (scope === "emails") {
    const emails = await db.emailLog.findMany({ orderBy: { createdAt: "desc" } });
    const rows: (string | number | null)[][] = [
      ["Date", "Destinataire", "Sujet", "Type", "Envoyé SMTP", "Erreur"],
      ...emails.map((e) => [
        e.createdAt.toISOString().slice(0, 16).replace("T", " "),
        e.toEmail,
        e.subject,
        e.kind,
        e.sent ? "oui" : "non",
        e.error,
      ]),
    ];
    return new NextResponse(toCsv(rows), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="liquidhome-emails-${stamp}.csv"`,
      },
    });
  }

  const [orders, equipmentOrders, invoices] = await Promise.all([
    db.order.findMany({ orderBy: { createdAt: "desc" } }),
    db.equipmentOrder.findMany({ orderBy: { createdAt: "desc" } }),
    db.invoice.findMany({ orderBy: { issuedAt: "desc" } }),
  ]);

  const rows: (string | number | null)[][] = [
    ["Type", "Référence", "Date", "Client", "Email", "Téléphone", "Détail", "Montant USD", "Statut"],
    ...orders.map((o) => [
      "Abonnement",
      o.ref,
      o.createdAt.toISOString().slice(0, 10),
      `${o.firstName} ${o.lastName}`,
      o.email,
      o.phone,
      `${o.packageId} · ${o.streetAddress}, ${o.houseNo}`,
      o.packagePrice,
      o.status,
    ]),
    ...equipmentOrders.map((o) => [
      "Équipement",
      o.ref,
      o.createdAt.toISOString().slice(0, 10),
      o.buyerName,
      o.buyerEmail,
      o.buyerPhone,
      JSON.parse(o.items)
        .map((i: { name: string; qty: number }) => `${i.name} ×${i.qty}`)
        .join(", "),
      o.total,
      o.status,
    ]),
    ...invoices
      .filter((i) => i.status === "paid")
      .map((i) => [
        "Paiement",
        i.number,
        i.issuedAt.toISOString().slice(0, 10),
        "",
        "",
        "",
        `${i.period}${i.orderRef ? ` · commande ${i.orderRef}` : ""} · ${i.method === "card" ? "carte" : "mobile money"}`,
        i.amount,
        "payé",
      ]),
  ];

  return new NextResponse(toCsv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="liquidhome-ventes-${stamp}.csv"`,
    },
  });
}
