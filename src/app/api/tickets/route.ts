import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { refCode, getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ok: false, message: "Connexion requise." }, { status: 401 });
  }

  const tickets = await db.ticket.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ ok: true, tickets });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ok: false, message: "Connexion requise." }, { status: 401 });
  }
  try {
    const body = await req.json();
    const subject = (body?.subject ?? "").toString().trim();
    const message = (body?.message ?? "").toString().trim();
    const priority = (body?.priority ?? "normal").toString().trim();

    if (!subject || !message) {
      return NextResponse.json({ ok: false, message: "Objet et message requis." }, { status: 400 });
    }
    const ticket = await db.ticket.create({
      data: {
        ref: refCode("SUP"),
        userId: user.id,
        subject,
        message,
        priority: ["normal", "high", "urgent"].includes(priority) ? priority : "normal",
      },
    });
    return NextResponse.json({
      ok: true,
      ticket: {
        id: ticket.id,
        ref: ticket.ref,
        subject: ticket.subject,
        message: ticket.message,
        priority: ticket.priority,
        status: ticket.status,
      },
      message: `Ticket ${ticket.ref} ouvert avec succès. Notre support vous répond dans les plus brefs délais.`,
    });
  } catch (err) {
    console.error("Ticket create error:", err);
    return NextResponse.json({ ok: false, message: "Erreur serveur." }, { status: 500 });
  }
}
