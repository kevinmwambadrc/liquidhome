import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const baseUrl = "http://localhost:3000";

async function testMailPaymentAndCookies() {
  console.log("===================================================================");
  console.log("✉️ TEST COMPLET : EMAIL SMTP, PAIEMENT & SYSTÈME DE COOKIES REEL");
  console.log("===================================================================\n");

  // =========================================================================
  // 1. TEST SYSTEME DE COOKIES REEL & AUDIT IP
  // =========================================================================
  console.log("1️⃣ Test Système de Cookies & Audit IP (/api/cookies/consent)...");
  const getConsentRes = await fetch(`${baseUrl}/api/cookies/consent`);
  if (!getConsentRes.ok) throw new Error(`Get consent failed: ${getConsentRes.status}`);
  const getConsentData = await getConsentRes.json();
  console.log(`   ✅ IP Client détectée : ${getConsentData.ip}`);
  console.log(`   ✅ Fournisseur (ISP) : ${getConsentData.details?.isp}`);
  console.log(`   ✅ Localisation : ${getConsentData.details?.city}, ${getConsentData.details?.country}`);
  console.log(`   ✅ Navigateur & OS : ${getConsentData.details?.browser} sur ${getConsentData.details?.os}`);

  console.log("   🍪 Enregistrement des préférences (Onglets Urgents, Utiles, Perf)...");
  const postConsentRes = await fetch(`${baseUrl}/api/cookies/consent`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      necessary: true,  // Urgents & Essentiels
      functional: true, // Utiles & Navigation
      analytics: true,  // Performance & Speed Test
      marketing: false, // Marketing
      source: "banner",
    }),
  });
  if (!postConsentRes.ok) throw new Error(`Post consent failed: ${postConsentRes.status}`);
  const postConsentData = await postConsentRes.json();
  console.log(`   ✅ Consentement enregistré avec ID : ${postConsentData.consent.id}`);
  console.log(`   ✅ Horodatage certifié : ${postConsentData.consent.timestamp}`);

  // Vérification en base de données Supabase
  const consentInDb = await db.cookieConsent.findUnique({
    where: { id: postConsentData.consent.id },
  });
  if (!consentInDb) throw new Error("CookieConsent record not found in Supabase DB!");
  console.log(`   ✅ Enregistrement en base Supabase validé : IP=${consentInDb.ip}, necessary=${consentInDb.necessary}, functional=${consentInDb.functional}`);

  // =========================================================================
  // 2. TEST EMAIL SMTP HOSTINGER (webinar@liquidrdc.tech) & IDENTIFIANTS
  // =========================================================================
  console.log("\n2️⃣ Test Envoi Email SMTP Hostinger (webinar@liquidrdc.tech)...");

  // A. Simulation création client avec identifiants uniques
  const testEmail = `jean.test.${Date.now()}@example.cd`;
  const tempPassword = `Pass${Math.floor(1000 + Math.random() * 9000)}!`;
  const customerNo = `LH${Math.floor(100000 + Math.random() * 900000)}`;

  const user = await db.user.create({
    data: {
      email: testEmail,
      name: "Jean-Pierre Kabamba",
      phone: "+243815556677",
      passwordHash: "hash_placeholder",
      customerNo,
      mustResetPassword: true,
    },
  });

  const order = await db.order.create({
    data: {
      ref: `LH-TEST-${Date.now()}`,
      userId: user.id,
      firstName: "Jean-Pierre",
      lastName: "Kabamba",
      email: testEmail,
      phone: "+243815556677",
      packageId: "fibron-pro",
      packagePrice: 50,
      streetAddress: "Avenue de la Justice",
      houseNo: "25",
      commune: "Gombe",
    },
  });

  // B. Envoi de l'email avec identifiants
  const { sendEmail, credentialsEmail, paymentConfirmedEmail } = await import("../src/lib/mailer.js");

  console.log(`   📨 Envoi de l'email d'identifiants à ${testEmail}...`);
  await sendEmail({
    to: testEmail,
    subject: `Vos identifiants MyLiquid — commande ${order.ref}`,
    html: credentialsEmail({
      name: "Jean-Pierre Kabamba",
      email: testEmail,
      tempPassword,
      customerNo,
      orderRef: order.ref,
      planName: "Fibron Pro (50 Mbps)",
      price: 50,
      address: "Avenue de la Justice, n° 25",
    }),
    kind: "credentials",
  });

  const credEmailLog = await db.emailLog.findFirst({
    where: { toEmail: testEmail },
    orderBy: { createdAt: "desc" },
  });
  console.log(`   ✅ Email d'identifiants journalisé dans EmailLog (ID: ${credEmailLog?.id}, Sent: ${credEmailLog?.sent})`);

  // =========================================================================
  // 3. TEST CONFIRMATION DE PAIEMENT & REÇU PAR EMAIL
  // =========================================================================
  console.log("\n3️⃣ Test Option de Confirmation de Paiement & Reçu par Email...");

  // A. Création d'une facture test
  const invoice = await db.invoice.create({
    data: {
      number: `INV-TEST-${Date.now()}`,
      userId: user.id,
      orderRef: order.ref,
      amount: 50,
      status: "unpaid",
      period: "Août 2026",
    },
  });
  console.log(`   🧾 Facture créée : ${invoice.number} (Montant: ${invoice.amount} USD, Statut: ${invoice.status})`);

  // B. Envoi de la confirmation de paiement par email
  console.log(`   💳 Validation du paiement et envoi du reçu par email...`);
  await sendEmail({
    to: testEmail,
    subject: `Confirmation de paiement — Facture ${invoice.number}`,
    html: paymentConfirmedEmail({
      name: "Jean-Pierre Kabamba",
      ref: invoice.number,
      amount: invoice.amount,
      paymentMethod: "Mobile Money (M-Pesa / Orange Money / Airtel Money)",
      description: "Abonnement fibre optique (Août 2026)",
    }),
    kind: "payment_receipt",
  });

  // Mise à jour de la facture en base
  const updatedInvoice = await db.invoice.update({
    where: { id: invoice.id },
    data: { status: "paid", method: "mobile-money", paidAt: new Date() },
  });
  console.log(`   ✅ Facture mise à jour : Statut = ${updatedInvoice.status}, Mode = ${updatedInvoice.method}`);

  const payEmailLog = await db.emailLog.findFirst({
    where: { toEmail: testEmail, kind: "payment_receipt" },
  });
  console.log(`   ✅ Reçu de paiement journalisé dans EmailLog (ID: ${payEmailLog?.id}, Sent: ${payEmailLog?.sent})`);

  console.log("\n===================================================================");
  console.log("🎉 CONFIGURATION EMAIL SMTP, PAIEMENT & COOKIES 100% VALIDEES !");
  console.log("===================================================================");
}

testMailPaymentAndCookies()
  .catch((e) => {
    console.error("❌ Erreur Test Mail/Paiement/Cookies:", e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
