import { db } from "@/lib/db";

/**
 * Transactional email helper.
 * - Sends live emails via Hostinger SMTP (webinar@liquidrdc.tech).
 * - Always records the message in the EmailLog table in Supabase.
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

  const host = process.env.SMTP_HOST || "smtp.hostinger.com";
  const port = parseInt(process.env.SMTP_PORT || "465", 10);
  const secure = process.env.SMTP_SECURE === "true" || port === 465;
  const user = process.env.SMTP_USER || "webinar@liquidrdc.tech";
  const pass = process.env.SMTP_PASS || "Webinar@2026.";
  const mailFrom = process.env.MAIL_FROM || `Liquid Home RDC <${user}>`;

  if (user && pass) {
    try {
      const nodemailer = await import("nodemailer");
      const transport = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
        tls: { rejectUnauthorized: false },
        connectionTimeout: 10000,
      });

      await transport.sendMail({
        from: mailFrom,
        to: opts.to,
        subject: opts.subject,
        html: opts.html,
        text: opts.text ?? opts.html.replace(/<[^>]+>/g, " "),
      });
      sent = true;
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
      console.warn("Hostinger SMTP notice:", error);
    }
  } else {
    error = "SMTP non configuré — email journalisé.";
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
  <div style="background:linear-gradient(135deg,#273c88 0%,#102a6b 60%,#f89e3d 100%);padding:28px;text-align:center;">
    <img src="https://home.liquidrdc.tech/img/colour_liquid_home2.png" alt="Liquid Home" style="height:42px;" />
  </div>`;

export function emailShell(title: string, innerHtml: string): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://home.liquidrdc.tech";
  return `<!doctype html><html><body style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background:#f4f5f8;padding:24px;">
    <div style="max-width:580px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;box-shadow:0 4px 12px rgba(0,0,0,0.05);">
      ${BRAND_HEADER}
      <div style="padding:32px 28px;color:#1e293b;line-height:1.6;">
        <h2 style="color:#273c88;margin:0 0 16px;font-size:20px;">${title}</h2>
        ${innerHtml}
      </div>
      <div style="padding:18px 28px;background:#f8fafc;color:#64748b;font-size:12px;border-top:1px solid #e2e8f0;text-align:center;">
        <p style="margin:0 0 4px;"><strong>Liquid Home RDC</strong> · Boulevard du 30 Juin, Gombe, Kinshasa</p>
        <p style="margin:0;">Support 24/7 : <strong>4757</strong> ou <strong>+243 84 899 4757</strong> · <a href="${appUrl}" style="color:#f89e3d;text-decoration:none;">home.liquidrdc.tech</a></p>
      </div>
    </div>
  </body></html>`;
}

export function credentialsEmail(params: {
  name: string;
  email: string;
  tempPassword: string;
  customerNo?: string | null;
  orderRef: string;
  planName: string;
  price: number;
  address: string;
}): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://home.liquidrdc.tech";
  return emailShell(
    "Vos identifiants d'accès MyLiquid & Confirmation de commande",
    `
    <p>Bonjour <strong>${params.name}</strong>,</p>
    <p>Nous vous confirmons l'enregistrement de votre souscription fibre optique <strong>${params.orderRef}</strong>.</p>
    
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px;margin:16px 0;">
      <h3 style="color:#273c88;margin:0 0 10px;font-size:14px;text-transform:uppercase;letter-spacing:0.5px;">Récapitulatif de votre commande</h3>
      <ul style="margin:0;padding-left:20px;color:#334155;font-size:14px;">
        <li><strong>Forfait :</strong> ${params.planName} — ${params.price} USD/mois</li>
        <li><strong>Adresse d'installation :</strong> ${params.address}</li>
        <li><strong>Délai d'intervention :</strong> ≤ 5 jours ouvrés</li>
      </ul>
    </div>

    <h3 style="color:#273c88;margin:20px 0 8px;font-size:15px;">Vos identifiants uniques MyLiquid</h3>
    <p style="margin:0 0 12px;font-size:14px;color:#475569;">Connectez-vous à votre espace personnel pour suivre votre déploiement, payer vos factures et configurer votre compte :</p>
    
    <div style="background:#f0f4ff;border:1px solid #c7d7fe;border-radius:12px;padding:18px;margin:14px 0;">
      ${params.customerNo ? `<p style="margin:4px 0;font-size:14px;"><strong>Numéro Client :</strong> <span style="font-family:monospace;font-weight:bold;color:#273c88;">${params.customerNo}</span></p>` : ""}
      <p style="margin:4px 0;font-size:14px;"><strong>Identifiant (Email) :</strong> ${params.email}</p>
      <p style="margin:6px 0;font-size:14px;"><strong>Mot de passe initial :</strong> <code style="background:#ffffff;padding:4px 8px;border-radius:6px;border:1px solid #cbd5e1;font-size:15px;font-weight:bold;color:#0f172a;">${params.tempPassword}</code></p>
    </div>

    <div style="text-align:center;margin:24px 0;">
      <a href="${appUrl}/myliquid" style="background:#f89e3d;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:10px;font-weight:bold;font-size:14px;display:inline-block;box-shadow:0 4px 10px rgba(248,158,61,0.3);">Accéder à mon espace MyLiquid →</a>
    </div>

    <p style="color:#b91c1c;font-size:12px;background:#fef2f2;border:1px solid #fecaca;padding:10px;border-radius:8px;">
      🔒 <strong>Sécurité :</strong> Vos identifiants sont modifiables à tout moment dans votre onglet <em>Profil</em>. Il vous sera demandé de choisir un nouveau mot de passe personnalisé dès votre première connexion.
    </p>
    `
  );
}

export function paymentConfirmedEmail(params: {
  name: string;
  ref: string;
  amount: number;
  paymentMethod: string;
  description: string;
  receiptUrl?: string;
}): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://home.liquidrdc.tech";
  return emailShell(
    "Confirmation de paiement validé — Liquid Home",
    `
    <p>Bonjour <strong>${params.name}</strong>,</p>
    <p>Nous vous confirmons la bonne réception de votre règlement de <strong>${params.amount} USD</strong>.</p>
    
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px;margin:16px 0;">
      <h3 style="color:#166534;margin:0 0 10px;font-size:14px;text-transform:uppercase;">Détails de la transaction</h3>
      <ul style="margin:0;padding-left:20px;color:#14532d;font-size:14px;">
        <li><strong>Référence :</strong> ${params.ref}</li>
        <li><strong>Objet :</strong> ${params.description}</li>
        <li><strong>Montant payé :</strong> ${params.amount} USD</li>
        <li><strong>Mode de règlement :</strong> ${params.paymentMethod}</li>
        <li><strong>Statut :</strong> Payé &amp; Validé ✓</li>
      </ul>
    </div>

    <p style="font-size:14px;">Votre reçu est disponible en téléchargement dans votre espace MyLiquid.</p>

    <div style="text-align:center;margin:20px 0;">
      <a href="${appUrl}/myliquid" style="background:#273c88;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:10px;font-weight:bold;font-size:14px;display:inline-block;">Consulter mon compte MyLiquid</a>
    </div>

    <p style="color:#64748b;font-size:12px;">Merci de votre confiance et de votre fidélité à Liquid Home RDC.</p>
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
        `<tr><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;">${i.name} × ${i.qty}</td><td align="right" style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-weight:bold;">${i.unitPrice * i.qty} USD</td></tr>`
    )
    .join("");
  return emailShell(
    "Confirmation de votre commande d'équipement",
    `
    <p>Bonjour <strong>${params.name}</strong>,</p>
    <p>Votre commande de matériel <strong>${params.ref}</strong> a été enregistrée avec succès. Notre service logistique prépare votre livraison.</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px;">
      ${rows}
      <tr><td style="padding:12px 0;border-top:2px solid #273c88;font-weight:bold;">Total</td><td align="right" style="padding:12px 0;border-top:2px solid #273c88;font-weight:bold;color:#f89e3d;font-size:16px;">${params.total} USD</td></tr>
    </table>
    <p>Merci pour votre confiance !</p>
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
    "Reçu de réabonnement fibre",
    `
    <p>Bonjour <strong>${params.name}</strong>,</p>
    <p>Votre réabonnement pour la période <strong>${params.period}</strong> a bien été validé :</p>
    <ul style="color:#334155;font-size:14px;">
      <li><strong>Montant :</strong> ${params.amount} USD</li>
      <li><strong>Mode de paiement :</strong> ${params.method === "card" ? "Carte bancaire" : "Mobile Money"}</li>
      <li><strong>Statut de la ligne :</strong> Active &amp; Opérationnelle ✓</li>
    </ul>
    <p>Merci de votre fidélité !</p>
    `
  );
}

export function coverageRequestEmail(params: {
  name: string;
  ref: string;
  address: string;
  commune?: string | null;
}): string {
  return emailShell(
    "Demande d'extension de couverture fibre — Liquid Home",
    `
    <p>Bonjour <strong>${params.name}</strong>,</p>
    <p>Nous avons bien reçu votre demande d'extension de couverture fibre optique (Réf: <strong>${params.ref}</strong>).</p>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px;margin:16px 0;">
      <p style="margin:4px 0;font-size:14px;"><strong>Adresse demandée :</strong> ${params.address}</p>
      ${params.commune ? `<p style="margin:4px 0;font-size:14px;"><strong>Zone / Commune :</strong> ${params.commune}</p>` : ""}
    </div>
    <p style="font-size:14px;">Nos ingénieurs réseau étudient actuellement le tracé de la boucle fibre pour votre secteur. Un conseiller Liquid Home vous tiendra informé de l'avancement du raccordement.</p>
    <p>Merci de votre intérêt envers la fibre Liquid Home !</p>
    `
  );
}
