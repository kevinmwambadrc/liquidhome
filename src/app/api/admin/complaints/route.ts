import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { sendEmail } from "@/lib/mailer";

const VALID = ["open", "in-progress", "resolved"];

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, message: "Accès refusé." }, { status: 403 });
  }

  const complaints = await db.complaint.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ ok: true, complaints });
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
    const adminReply = body?.adminReply ? body.adminReply.toString().trim() : undefined;

    if (!id) {
      return NextResponse.json({ ok: false, message: "ID manquant." }, { status: 400 });
    }

    const data: { status?: string; adminReply?: string; repliedAt?: Date } = {};
    if (status && VALID.includes(status)) {
      data.status = status;
    }
    if (adminReply !== undefined) {
      data.adminReply = adminReply;
      data.repliedAt = new Date();
      if (!data.status) {
        data.status = "in-progress";
      }
    }

    const updated = await db.complaint.update({ where: { id }, data });

    if (adminReply && updated.email) {
      await sendEmail({
        to: updated.email,
        subject: `[Liquid Home RDC] Suivi de votre réclamation ${updated.ticket}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <h2 style="color: #002d62;">Suivi de votre réclamation ${updated.ticket}</h2>
            <p>Bonjour <strong>${updated.name}</strong>,</p>
            <p>Notre service qualité a pris en charge votre réclamation :</p>
            <div style="background-color: #f8f9fa; border-left: 4px solid #002d62; padding: 12px; margin: 15px 0; color: #666;">
              "${updated.message}"
            </div>
            <p>Réponse apportée :</p>
            <div style="background-color: #fff4ec; border-left: 4px solid #ff5c00; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; color: #333; font-size: 15px; white-space: pre-wrap;">${adminReply}</p>
            </div>
            <p>Statut actuel : <strong>${updated.status.toUpperCase()}</strong></p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0 10px 0;" />
            <p style="font-size: 12px; color: #888;">Liquid Home RDC • Service Qualité &amp; Réclamations</p>
          </div>
        `,
        kind: "complaint-reply",
      }).catch((err) => console.error("Email send note:", err));
    }

    return NextResponse.json({
      ok: true,
      complaint: updated,
      message: adminReply ? `Réponse envoyée au client pour ${updated.ticket}.` : `Ticket ${updated.ticket} → ${updated.status}.`,
    });
  } catch (error) {
    console.error("Complaint update error:", error);
    return NextResponse.json({ ok: false, message: "Erreur serveur." }, { status: 500 });
  }
}
