import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { sendEmail } from "@/lib/mailer";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, message: "Accès refusé." }, { status: 403 });
  }

  const messages = await db.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ ok: true, messages });
}

export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, message: "Accès refusé." }, { status: 403 });
  }
  try {
    const body = await req.json();
    const id = (body?.id ?? "").toString();
    const handled = body?.handled !== undefined ? !!body.handled : undefined;
    const adminReply = body?.adminReply ? body.adminReply.toString().trim() : undefined;

    if (!id) {
      return NextResponse.json({ ok: false, message: "ID manquant." }, { status: 400 });
    }

    const data: { handled?: boolean; adminReply?: string; repliedAt?: Date } = {};
    if (handled !== undefined) data.handled = handled;
    if (adminReply !== undefined) {
      data.adminReply = adminReply;
      data.repliedAt = new Date();
      data.handled = true;
    }

    const updated = await db.contactMessage.update({
      where: { id },
      data,
    });

    if (adminReply && updated.email) {
      await sendEmail({
        to: updated.email,
        subject: `[Liquid Home RDC] Réponse à votre demande de contact`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <h2 style="color: #002d62;">Réponse de l'équipe Liquid Home RDC</h2>
            <p>Bonjour <strong>${updated.firstName} ${updated.lastName}</strong>,</p>
            <p>Nous faisons suite à votre message :</p>
            <div style="background-color: #f8f9fa; border-left: 4px solid #002d62; padding: 12px; margin: 15px 0; color: #666; font-style: italic;">
              "${updated.requirements || 'Demande de renseignement'}"
            </div>
            <p>Notre équipe commerciale/support vous informe :</p>
            <div style="background-color: #fff4ec; border-left: 4px solid #ff5c00; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; color: #333; font-size: 15px; white-space: pre-wrap;">${adminReply}</p>
            </div>
            <p>Nous restons à votre entière disposition pour tout complément d'information.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0 10px 0;" />
            <p style="font-size: 12px; color: #888;">Liquid Home RDC • Service Client Kinshasa</p>
          </div>
        `,
        kind: "contact-reply",
      }).catch((err) => console.error("Email send note:", err));
    }

    return NextResponse.json({
      ok: true,
      message: adminReply ? "Réponse envoyée avec succès." : handled ? "Message marqué traité." : "Message réouvert.",
      updated,
    });
  } catch (error) {
    console.error("Admin message error:", error);
    return NextResponse.json({ ok: false, message: "Erreur serveur." }, { status: 500 });
  }
}
