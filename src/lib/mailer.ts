import { db } from "@/lib/db";

/**
 * Transactional email helper.
 * - Always records the message in the EmailLog table (visible in the admin
 *   "Emails" tab), so the flow is verifiable without an SMTP server.
 * - Actually delivers via SMTP when SMTP_URL is configured
 *   (smtp://user:pass@host:port). Otherwise the log entry stays sent=false.
 */
export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  text?: string;
  kind?: string;
}): Promise<void> {
  let sent = false;
  let error: string | null = null;

  const smtpUrl = process.env.SMTP_URL;
  if (smtpUrl) {
    try {
      const nodemailer = await import("nodemailer");
      const transport = nodemailer.createTransport(smtpUrl);
      await transport.sendMail({
        from: process.env.MAIL_FROM ?? "Liquid Home RDC <DRCfibre@liquid.tech>",
        to: opts.to,
        subject: opts.subject,
        html: opts.html,
        text: opts.text ?? opts.html.replace(/<[^>]+>/g, " "),
      });
      sent = true;
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
    }
  } else {
    error = "SMTP_URL non configuré — email journalisé uniquement.";
  }

  await db.emailLog.create({
    data: {
      toEmail: opts.to,
      subject: opts.subject,
      body: opts.html,
      sent,
      error,
      kind: opts.kind ?? "generic",
    },
  });
}

const BRAND_HEADER = `
  <div style="background:linear-gradient(135deg,#273c88 0%,#273c88 60%,#f89e3d 100%);padding:28px;text-align:center;">
    <img src="https://cd.liquidhome.tech/img/colour_liquid_home2.png" alt="Liquid Home" style="height:40px;" />
  </div>`;

export function emailShell(title: string, innerHtml: string): string {
  return `<!doctype html><html><body style="margin:0;font-family:Helvetica,Arial,sans-serif;background:#f0f0f0;padding:24px;">
    <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px:#e5e5e5 solid;">
      ${BRAND_HEADER}
      <div style="padding:28px;color:#333;">
        <h2 style="color:#273c88;margin:0 0 14px;">${title}</h2>
        ${innerHtml}
      </div>
      <div style="padding:16px 28px;background:#f0f0f0;color:#888;font-size:11px;">
        Liquid Home RDC · Kinshasa · Service client 4757 · DRCfibre@liquid.tech
      </div>
    </div>
  </body></html>`;
}

export function credentialsEmail(params: {
  name: string;
  email: string;
  tempPassword: string;
  orderRef: string;
  planName: string;
  price: number;
  address: string;
}): string {
  return emailShell(
    "Bienvenue chez Liquid Home !",
    `
    <p>Bonjour ${params.name},</p>
    <p>Votre commande <b>${params.orderRef}</b> a bien été enregistrée :</p>
    <ul>
      <li><b>Forfait :</b> ${params.planName} — ${params.price} USD/mois</li>
      <li><b>Adresse d'installation :</b> ${params.address}</li>
      <li><b>Délai :</b> ≤ 5 jours ouvrés</li>
    </ul>
    <p>Voici vos identifiants pour votre espace client <b>MyLiquid</b> :</p>
    <div style="background:#f6f7fa;border:1px solid #e2e5ee;border-radius:8px;padding:14px;margin:12px 0;">
      <p style="margin:4px 0;"><b>Adresse :</b> ${params.email}</p>
      <p style="margin:4px 0;"><b>Mot de passe provisoire :</b> <code style="background:#fff;padding:2px 6px;border-radius:4px;border:1px solid #ddd;font-size:14px;">${params.tempPassword}</code></p>
    </div>
    <p style="color:#c0392b;"><b>Sécurité :</b> ce mot de passe est provisoire. Il vous sera demandé de le <b>réinitialiser dès votre première connexion</b>.</p>
    <p>Connectez-vous sur <a href="https://cd.liquidhome.tech/myliquid" style="color:#e29037;">votre espace MyLiquid</a> pour suivre votre commande, payer vos factures et contacter le support.</p>
    <p style="color:#888;font-size:12px;">Si vous n'êtes pas à l'origine de cette demande, contactez-nous au 4757.</p>
    `
  );
}

export function orderConfirmationEmail(params: {
  name: string;
  ref: string;
  items: { name: string; unitPrice: number; qty: number }[];
  total: number;
}): string {
  const rows = params.items
    .map(
      (i) =>
        `<tr><td style="padding:6px 0;">${i.name} × ${i.qty}</td><td align="right">${i.unitPrice * i.qty} USD</td></tr>`
    )
    .join("");
  return emailShell(
    "Confirmation de votre commande",
    `
    <p>Bonjour ${params.name},</p>
    <p>Votre commande d'équipement <b>${params.ref}</b> est confirmée. Notre équipe vous contactera pour la livraison.</p>
    <table style="width:100%;border-collapse:collapse;margin:12px 0;">
      ${rows}
      <tr><td style="padding:8px 0;border-top:2px solid #273c88;"><b>Total</b></td><td align="right" style="padding:8px 0;border-top:2px solid #273c88;"><b>${params.total} USD</b></td></tr>
    </table>
    <p>Merci de votre confiance !</p>
    `
  );
}

export function topupEmail(params: {
  name: string;
  amount: number;
  period: string;
  method: string;
}): string {
  return emailShell(
    "Reçu de réabonnement",
    `
    <p>Bonjour ${params.name},</p>
    <p>Votre réabonnement a bien été pris en compte :</p>
    <ul>
      <li><b>Montant :</b> ${params.amount} USD</li>
      <li><b>Période :</b> ${params.period}</li>
      <li><b>Moyen de paiement :</b> ${params.method === "card" ? "Carte bancaire" : "Mobile Money"}</li>
    </ul>
    <p>Votre ligne fibre reste active. Merci de votre fidélité !</p>
    `
  );
}
