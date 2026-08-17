import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { refCode, getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ok: false, message: "Connexion requise." }, { status: 401 });
  }
  try {
    const body = await req.json();
    const subject = (body?.subject ?? "").toString().trim();
    const message = (body?.message ?? "").toString().trim();
    if (!subject || !message) {
      return NextResponse.json({ ok: false, message: "Objet et message requis." }, { status: 400 });
    }
    const ticket = await db.ticket.create({
      data: {
        ref: refCode("SUP"),
        userId: user.id,
        subject,
        message,
      },
    });
    return NextResponse.json({
      ok: true,
      ticket: { id: ticket.id, ref: ticket.ref },
      message: `Ticket ${ticket.ref} ouvert. Notre support vous répond sous 24h.`,
    });
  } catch {
    return NextResponse.json({ ok: false, message: "Erreur serveur." }, { status: 500 });
  }
}
