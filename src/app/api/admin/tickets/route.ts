import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { sendEmail } from "@/lib/mailer";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, message: "Accès refusé." }, { status: 403 });
  }

  const tickets = await db.ticket.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          customerNo: true,
        },
      },
    },
  });

  return NextResponse.json({ ok: true, tickets });
}

export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, message: "Accès refusé." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const id = (body?.id ?? "").toString();
    const status = body?.status ? body.status.toString() : undefined;
    const priority = body?.priority ? body.priority.toString() : undefined;
    const adminReply = body?.adminReply ? body.adminReply.toString().trim() : undefined;

    if (!id) {
      return NextResponse.json({ ok: false, message: "ID ticket manquant." }, { status: 400 });
    }

    const data: {
      status?: string;
      priority?: string;
      adminReply?: string;
      repliedAt?: Date;
    } = {};

    if (status && ["open", "in-progress", "resolved"].includes(status)) {
      data.status = status;
    }
    if (priority && ["normal", "high", "urgent"].includes(priority)) {
      data.priority = priority;
    }
    if (adminReply !== undefined) {
      data.adminReply = adminReply;
      data.repliedAt = new Date();
      if (!data.status) {
        data.status = "in-progress";
      }
    }

    const updated = await db.ticket.update({
      where: { id },
      data,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // If an admin response was provided, send an email notification to the client
    if (adminReply && updated.user?.email) {
      await sendEmail({
        to: updated.user.email,
        subject: `[Liquid Home] Réponse à votre ticket ${updated.ref}: ${updated.subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <h2 style="color: #002d62;">Réponse de l'équipe Support Liquid Home</h2>
            <p>Bonjour <strong>${updated.user.name || "Client"}</strong>,</p>
            <p>Notre équipe technique a répondu à votre ticket <strong>${updated.ref}</strong> (<em>${updated.subject}</em>) :</p>
            <div style="background-color: #f8f9fa; border-left: 4px solid #ff5c00; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; color: #333; font-size: 15px; white-space: pre-wrap;">${adminReply}</p>
            </div>
            <p>Statut du ticket : <span style="font-weight: bold; color: #002d62;">${updated.status.toUpperCase()}</span></p>
            <p>Vous pouvez consulter votre espace client à tout moment pour suivre l'historique complet :</p>
            <a href="https://home.liquidrdc.tech/myliquid" style="display: inline-block; background-color: #002d62; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 10px;">Accéder à MyLiquid</a>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0 10px 0;" />
            <p style="font-size: 12px; color: #888;">Liquid Home RDC • Support Client &amp; Assistance Technique</p>
          </div>
        `,
        kind: "ticket-reply",
      }).catch((err) => console.error("Email send note:", err));
    }

    return NextResponse.json({
      ok: true,
      ticket: updated,
      message: adminReply
        ? `Réponse envoyée au client pour le ticket ${updated.ref}.`
        : `Ticket ${updated.ref} mis à jour.`,
    });
  } catch (error) {
    console.error("Admin ticket update error:", error);
    return NextResponse.json({ ok: false, message: "Erreur serveur." }, { status: 500 });
  }
}
