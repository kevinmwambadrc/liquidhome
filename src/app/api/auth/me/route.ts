import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ok: true, user: null }, { status: 200 });
  }
  const [orders, invoices, tickets] = await Promise.all([
    db.order.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
    db.invoice.findMany({ where: { userId: user.id }, orderBy: { issuedAt: "desc" } }),
    db.ticket.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
  ]);
  return NextResponse.json({
    ok: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      customerNo: user.customerNo,
      mustResetPassword: user.mustResetPassword,
      kycStatus: user.kycStatus,
      createdAt: user.createdAt,
    },
    orders,
    invoices,
    tickets,
  });
}
