import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, message: "Accès refusé." }, { status: 403 });
  }

  const [orders, messages, complaints, subscribers, users, invoices, packages, equipments, posts, coverageRequests, equipmentOrders, emails, kycUsers, paymentTransactions] = await Promise.all([
    db.order.findMany({ orderBy: { createdAt: "desc" }, include: { user: { select: { customerNo: true } } } }),
    db.contactMessage.findMany({ orderBy: { createdAt: "desc" } }),
    db.complaint.findMany({ orderBy: { createdAt: "desc" } }),
    db.newsletterSubscriber.findMany({ orderBy: { createdAt: "desc" } }),
    db.user.count({ where: { role: "client" } }),
    db.invoice.findMany({ orderBy: { issuedAt: "desc" }, include: { user: { select: { name: true } } } }),
    db.package.findMany({ orderBy: { sortOrder: "asc" } }),
    db.equipment.findMany({ orderBy: { sortOrder: "asc" } }),
    db.post.findMany({ orderBy: { createdAt: "desc" } }),
    db.coverageRequest.findMany({ orderBy: { createdAt: "desc" } }),
    db.equipmentOrder.findMany({ orderBy: { createdAt: "desc" } }),
    db.emailLog.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
    db.user.findMany({
      where: { kycStatus: { not: null } },
      orderBy: { createdAt: "desc" },
      select: {
        id: true, name: true, email: true, phone: true, customerNo: true,
        kycStatus: true, kycDocType: true, kycDocUrl: true, createdAt: true,
      },
    }),
    db.paymentTransaction.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
  ]);

  const revenuePaid = invoices
    .filter((i) => i.status === "paid")
    .reduce((sum, i) => sum + i.amount, 0);
  const revenuePending = invoices
    .filter((i) => i.status === "unpaid")
    .reduce((sum, i) => sum + i.amount, 0);

  // Orders per day for the last 14 days
  const days: { date: string; count: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const next = new Date(d);
    next.setDate(next.getDate() + 1);
    days.push({
      date: d.toISOString().slice(5, 10),
      count: orders.filter((o) => o.createdAt >= d && o.createdAt < next).length,
    });
  }

  const packageCounts: Record<string, number> = {};
  for (const o of orders) {
    packageCounts[o.packageId] = (packageCounts[o.packageId] ?? 0) + 1;
  }

  // Equipment revenue + monthly revenue classification (paid invoices + delivered equipment)
  const equipmentRevenue = equipmentOrders
    .filter((o) => o.status !== "cancelled")
    .reduce((s, o) => s + o.total, 0);

  const monthly: { month: string; subscriptions: number; equipment: number; total: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    d.setMonth(d.getMonth() - i);
    const next = new Date(d);
    next.setMonth(next.getMonth() + 1);
    const subs = invoices
      .filter((v) => v.status === "paid" && v.issuedAt >= d && v.issuedAt < next)
      .reduce((s, v) => s + v.amount, 0);
    const equip = equipmentOrders
      .filter((o) => o.status !== "cancelled" && o.createdAt >= d && o.createdAt < next)
      .reduce((s, o) => s + o.total, 0);
    monthly.push({
      month: d.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" }),
      subscriptions: subs,
      equipment: equip,
      total: subs + equip,
    });
  }

  return NextResponse.json({
    ok: true,
    stats: {
      ordersTotal: orders.length,
      ordersPending: orders.filter((o) => o.status === "pending").length,
      ordersInstalled: orders.filter((o) => o.status === "installed").length,
      clients: users,
      messages: messages.length,
      messagesNew: messages.filter((m) => !m.handled).length,
      complaints: complaints.length,
      complaintsOpen: complaints.filter((c) => c.status !== "resolved").length,
      subscribers: subscribers.length,
      revenuePaid,
      revenuePending,
      equipmentRevenue,
      coverageRequests: coverageRequests.length,
      coverageRequestsNew: coverageRequests.filter((c) => c.status === "new").length,
      posts: posts.length,
      equipmentOrders: equipmentOrders.length,
      equipmentOrdersPending: equipmentOrders.filter((o) => o.status === "pending").length,
    },
    orders,
    messages,
    complaints,
    subscribers,
    invoices,
    packages: packages.map((p) => ({ ...p, features: JSON.parse(p.features) })),
    equipments,
    posts: posts.map((p) => ({ ...p, content: JSON.parse(p.content) })),
    coverageRequests,
    equipmentOrders: equipmentOrders.map((o) => ({ ...o, items: JSON.parse(o.items) })),
    emails,
    kycUsers,
    paymentTransactions,
    chart: { days, packageCounts, monthly },
  });
}
