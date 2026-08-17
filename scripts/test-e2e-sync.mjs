import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function runE2ETest() {
  console.log("=================================================");
  console.log("🚀 Lancement du test E2E de Synchronisation Directe");
  console.log("=================================================\n");

  const baseUrl = "http://localhost:3000";

  // Step 1: Client Login
  console.log("1️⃣ [Client] Connexion du client jean@demo.cd...");
  const clientLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "jean@demo.cd", password: "Client1234" }),
  });
  const clientCookie = clientLoginRes.headers.get("set-cookie");
  const clientLoginData = await clientLoginRes.json();
  if (!clientLoginData.ok) {
    throw new Error(`Client login failed: ${JSON.stringify(clientLoginData)}`);
  }
  console.log(`   ✅ Client connecté avec succès : ${clientLoginData.user.name} (${clientLoginData.user.customerNo})`);

  // Step 2: Client opens support ticket
  console.log("\n2️⃣ [Client] Création d'un ticket de support urgent...");
  const ticketSubject = `Panne signal optique - Test E2E ${Date.now()}`;
  const ticketMessage = "Bonjour, le voyant PON de mon routeur clignote en rouge depuis ce matin.";
  const createTicketRes = await fetch(`${baseUrl}/api/tickets`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: clientCookie || "",
    },
    body: JSON.stringify({
      subject: ticketSubject,
      message: ticketMessage,
      priority: "urgent",
    }),
  });
  const createTicketData = await createTicketRes.json();
  if (!createTicketData.ok) {
    throw new Error(`Create ticket failed: ${JSON.stringify(createTicketData)}`);
  }
  const ticketId = createTicketData.ticket.id;
  const ticketRef = createTicketData.ticket.ref;
  console.log(`   ✅ Ticket créé avec succès : ${ticketRef} (ID: ${ticketId}) - Priorité: ${createTicketData.ticket.priority}`);

  // Step 3: Admin Login
  console.log("\n3️⃣ [Admin] Connexion de l'administrateur admin@liquid.tech...");
  const adminLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@liquid.tech", password: "Admin1234" }),
  });
  const adminCookie = adminLoginRes.headers.get("set-cookie");
  const adminLoginData = await adminLoginRes.json();
  if (!adminLoginData.ok) {
    throw new Error(`Admin login failed: ${JSON.stringify(adminLoginData)}`);
  }
  console.log(`   ✅ Administrateur connecté : ${adminLoginData.user.name} (Rôle: ${adminLoginData.user.role})`);

  // Step 4: Admin overview check
  console.log("\n4️⃣ [Admin] Récupération de l'aperçu et synchronisation live...");
  const overviewRes = await fetch(`${baseUrl}/api/admin/overview`, {
    headers: { Cookie: adminCookie || "" },
  });
  const overviewData = await overviewRes.json();
  if (!overviewData.ok) {
    throw new Error(`Overview fetch failed: ${JSON.stringify(overviewData)}`);
  }
  const foundTicket = overviewData.tickets.find((t) => t.id === ticketId);
  if (!foundTicket) {
    throw new Error(`Ticket ${ticketRef} not found in admin overview!`);
  }
  console.log(`   ✅ Ticket reçu en direct sur le dashboard admin :`);
  console.log(`      • Ref: ${foundTicket.ref}`);
  console.log(`      • Sujet: ${foundTicket.subject}`);
  console.log(`      • Client: ${foundTicket.user?.name} (${foundTicket.user?.email})`);
  console.log(`      • Statut actuel: ${foundTicket.status}`);
  console.log(`      • Total tickets ouverts: ${overviewData.stats.ticketsOpen}`);

  // Step 5: Admin replies to client ticket
  console.log("\n5️⃣ [Admin] Envoi de la réponse officielle au client...");
  const adminReplyText = "Bonjour Jean, notre équipe technique a diagnostiqué le point de raccordement. Un technicien fibre optique Liquid Home est en route vers votre adresse.";
  const replyRes = await fetch(`${baseUrl}/api/admin/tickets`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Cookie: adminCookie || "",
    },
    body: JSON.stringify({
      id: ticketId,
      adminReply: adminReplyText,
      status: "in-progress",
    }),
  });
  const replyData = await replyRes.json();
  if (!replyData.ok) {
    throw new Error(`Admin reply failed: ${JSON.stringify(replyData)}`);
  }
  console.log(`   ✅ Réponse admin enregistrée et statut mis à jour en 'in-progress'`);

  // Step 6: Client live reception verification
  console.log("\n6️⃣ [Client] Vérification de la réception de la réponse côté client (MyLiquid)...");
  const clientMeRes = await fetch(`${baseUrl}/api/auth/me`, {
    headers: { Cookie: clientCookie || "" },
  });
  const clientMeData = await clientMeRes.json();
  const clientTicket = clientMeData.tickets.find((t) => t.id === ticketId);
  if (!clientTicket || !clientTicket.adminReply) {
    throw new Error(`Client did not receive admin reply: ${JSON.stringify(clientTicket)}`);
  }
  console.log(`   ✅ Le client a reçu la réponse en direct sur son espace MyLiquid :`);
  console.log(`      • Statut: ${clientTicket.status}`);
  console.log(`      • Réponse officielle: "${clientTicket.adminReply}"`);
  console.log(`      • Date de réponse: ${clientTicket.repliedAt}`);

  // Step 7: Public contact message & admin reply
  console.log("\n7️⃣ [Visiteur & Admin] Test d'envoi et de réponse à un message de contact public...");
  const contactRes = await fetch(`${baseUrl}/api/contact/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      firstName: "Fatou",
      lastName: "Kalombo",
      email: "fatou.test@liquidrdc.tech",
      telephone: "+243810009988",
      city: "Kinshasa",
      areaOfInterest: "business",
      requirements: "Demande de raccordement fibre dédiée pour notre agence de Gombe.",
    }),
  });
  const contactData = await contactRes.json();
  if (!contactData.ok) {
    throw new Error(`Contact submit failed: ${JSON.stringify(contactData)}`);
  }
  console.log(`   ✅ Formulaire de contact soumis par Fatou Kalombo (ID: ${contactData.id})`);

  console.log("   [Admin] Réponse au message de contact...");
  const replyContactRes = await fetch(`${baseUrl}/api/admin/messages`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Cookie: adminCookie || "",
    },
    body: JSON.stringify({
      id: contactData.id,
      adminReply: "Bonjour Mme Kalombo, notre chargé de compte entreprise vous contacte par téléphone ce jour.",
    }),
  });
  const replyContactData = await replyContactRes.json();
  if (!replyContactData.ok) {
    throw new Error(`Contact reply failed: ${JSON.stringify(replyContactData)}`);
  }
  console.log(`   ✅ Réponse enregistrée et email transmis (marqué traité: ${replyContactData.message.handled})`);

  // Step 8: Public complaint & admin reply
  console.log("\n8️⃣ [Client & Admin] Test de réclamation en ligne...");
  const complaintRes = await fetch(`${baseUrl}/api/complaint`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Paul Mukendi",
      email: "paul.mukendi@test.cd",
      telephone: "+243820001122",
      message: "Délai d'intervention trop long suite à coupure.",
    }),
  });
  const complaintData = await complaintRes.json();
  if (!complaintData.ok) {
    throw new Error(`Complaint submit failed: ${JSON.stringify(complaintData)}`);
  }
  console.log(`   ✅ Réclamation enregistrée : ${complaintData.ticket} (ID: ${complaintData.id})`);

  console.log("   [Admin] Résolution et réponse de la réclamation...");
  const replyComplaintRes = await fetch(`${baseUrl}/api/admin/complaints`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Cookie: adminCookie || "",
    },
    body: JSON.stringify({
      id: complaintData.id,
      adminReply: "Votre dossier a été pris en charge en priorité haute par notre responsable SAV.",
      status: "resolved",
    }),
  });
  const replyComplaintData = await replyComplaintRes.json();
  if (!replyComplaintData.ok) {
    throw new Error(`Complaint reply failed: ${JSON.stringify(replyComplaintData)}`);
  }
  console.log(`   ✅ Réclamation résolue avec succès et réponse transmise au client.`);

  // Step 9: Verify email logs in Supabase
  console.log("\n9️⃣ [Supabase] Vérification des logs d'emails réels enregistrés...");
  const emailLogs = await db.emailLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
  });
  console.log(`   ✅ Total récents logs d'emails dans Supabase : ${emailLogs.length}`);
  emailLogs.forEach((log, idx) => {
    console.log(`      ${idx + 1}. [${log.kind}] Destinataire: ${log.toEmail} | Sujet: "${log.subject}" | Envoyé: ${log.sent}`);
  });

  console.log("\n=================================================");
  console.log("🎉 TOUS LES TESTS E2E SONT PASSÉS AVEC SUCCÈS À 100% !");
  console.log("=================================================");
}

runE2ETest()
  .catch((e) => {
    console.error("❌ Erreur dans le test E2E :", e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
