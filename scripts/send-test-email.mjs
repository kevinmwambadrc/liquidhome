import nodemailer from "nodemailer";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function sendTestEmail() {
  console.log("=================================================");
  console.log("📨 TEST DIRECT D'ENVOI D'EMAIL VIA HOSTINGER SMTP");
  console.log("=================================================\n");

  const host = "smtp.hostinger.com";
  const port = 465;
  const user = "webinar@liquidrdc.tech";
  const pass = "Webinar@2026.";
  const to = "webinar@liquidrdc.tech"; // Mailbox de destination

  console.log(`🔌 Connexion au serveur SMTP Hostinger (${host}:${port})...`);
  console.log(`👤 Expéditeur : ${user}`);
  console.log(`🎯 Destinataire du test : ${to}`);

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: true, // Port 465 SSL
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  // 1. Vérification de la connexion SMTP
  console.log("⏳ Vérification de l'authentification SMTP...");
  await transporter.verify();
  console.log("✅ Authentification SMTP réussie avec succès !");

  // 2. Envoi du mail de test avec les identifiants MyLiquid
  const testCustomerNo = "LH-849201";
  const testOrderRef = "LH-TEST-2026";
  const tempPassword = "LiquidDemo2026!";

  const htmlContent = `
    <!doctype html>
    <html>
      <body style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background:#f4f5f8;padding:24px;">
        <div style="max-width:580px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;box-shadow:0 4px 12px rgba(0,0,0,0.06);">
          <div style="background:linear-gradient(135deg,#273c88 0%,#102a6b 60%,#f89e3d 100%);padding:28px;text-align:center;">
            <img src="https://home.liquidrdc.tech/img/colour_liquid_home2.png" alt="Liquid Home" style="height:42px;" />
          </div>
          <div style="padding:32px 28px;color:#1e293b;line-height:1.6;">
            <div style="display:inline-block;background:#ecfdf5;border:1px solid #a7f3d0;color:#065f46;font-size:12px;font-weight:bold;padding:4px 12px;border-radius:20px;margin-bottom:12px;">
              ✓ Test Serveur SMTP Réussi
            </div>
            <h2 style="color:#273c88;margin:0 0 16px;font-size:20px;">Bienvenue sur votre espace Liquid Home RDC</h2>
            <p>Bonjour <strong>Kevin Mwamba</strong>,</p>
            <p>Ceci est un <strong>email de test en direct</strong> confirmant que votre serveur SMTP Hostinger (<code>webinar@liquidrdc.tech</code>) est 100% opérationnel et prêt pour la production.</p>
            
            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px;margin:16px 0;">
              <h3 style="color:#273c88;margin:0 0 10px;font-size:14px;text-transform:uppercase;letter-spacing:0.5px;">Récapitulatif de votre commande</h3>
              <ul style="margin:0;padding-left:20px;color:#334155;font-size:14px;">
                <li><strong>Forfait Fibre :</strong> Fibron Pro (50 Mbps) — 50 USD/mois</li>
                <li><strong>Réf Commande :</strong> ${testOrderRef}</li>
                <li><strong>Adresse d'installation :</strong> Boulevard du 30 Juin, Gombe, Kinshasa</li>
                <li><strong>Délai d'intervention :</strong> ≤ 5 jours ouvrés</li>
              </ul>
            </div>

            <h3 style="color:#273c88;margin:20px 0 8px;font-size:15px;">Vos identifiants d'accès au dashboard client MyLiquid</h3>
            <p style="margin:0 0 12px;font-size:14px;color:#475569;">Vous pouvez vous connecter pour suivre votre commande et gérer vos services :</p>
            
            <div style="background:#f0f4ff;border:1px solid #c7d7fe;border-radius:12px;padding:18px;margin:14px 0;">
              <p style="margin:4px 0;font-size:14px;"><strong>Numéro Client :</strong> <span style="font-family:monospace;font-weight:bold;color:#273c88;">${testCustomerNo}</span></p>
              <p style="margin:4px 0;font-size:14px;"><strong>Identifiant (Email) :</strong> ${user}</p>
              <p style="margin:6px 0;font-size:14px;"><strong>Mot de passe temporaire :</strong> <code style="background:#ffffff;padding:4px 8px;border-radius:6px;border:1px solid #cbd5e1;font-size:15px;font-weight:bold;color:#0f172a;">${tempPassword}</code></p>
            </div>

            <div style="text-align:center;margin:24px 0;">
              <a href="https://home.liquidrdc.tech/myliquid" style="background:#f89e3d;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:10px;font-weight:bold;font-size:14px;display:inline-block;box-shadow:0 4px 10px rgba(248,158,61,0.3);">Se connecter à MyLiquid →</a>
            </div>

            <p style="color:#b91c1c;font-size:12px;background:#fef2f2;border:1px solid #fecaca;padding:10px;border-radius:8px;">
              🔒 <strong>Sécurité :</strong> Vos identifiants sont uniques et entièrement modifiables depuis votre onglet <em>Profil</em>.
            </p>
          </div>
          <div style="padding:18px 28px;background:#f8fafc;color:#64748b;font-size:12px;border-top:1px solid #e2e8f0;text-align:center;">
            <p style="margin:0 0 4px;"><strong>Liquid Home RDC</strong> · Boulevard du 30 Juin, Gombe, Kinshasa</p>
            <p style="margin:0;">Service Client 24/7 : <strong>4757</strong> · <a href="https://home.liquidrdc.tech" style="color:#f89e3d;text-decoration:none;">home.liquidrdc.tech</a></p>
          </div>
        </div>
      </body>
    </html>
  `;

  console.log("📤 Envoi de l'email en cours...");
  const info = await transporter.sendMail({
    from: `"Liquid Home RDC" <${user}>`,
    to,
    subject: "⚡ Test Réussi : Vos identifiants MyLiquid Liquid Home RDC",
    html: htmlContent,
    text: `Bienvenue sur Liquid Home ! Vos identifiants MyLiquid : Email: ${user}, Mot de passe: ${tempPassword}, Numéro Client: ${testCustomerNo}`,
  });

  console.log(`✅ Email envoyé avec succès ! Message ID : ${info.messageId}`);
  console.log(`📬 Réponse du serveur Hostinger : ${info.response}`);

  // Enregistrement dans la table EmailLog
  const log = await db.emailLog.create({
    data: {
      toEmail: to,
      subject: "⚡ Test Réussi : Vos identifiants MyLiquid Liquid Home RDC",
      body: htmlContent,
      sent: true,
      kind: "test_credentials",
    },
  });

  console.log(`📝 Email enregistré dans la table EmailLog (ID: ${log.id})`);
  console.log("\n=================================================");
  console.log("🎉 TEST D'ENVOI D'EMAIL 100% REUSSI !");
  console.log("=================================================");
}

sendTestEmail()
  .catch((err) => {
    console.error("❌ Échec de l'envoi de l'email :", err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
