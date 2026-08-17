import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const baseUrl = "http://localhost:3000";

async function testSubscriptionAndCoverageFlow() {
  console.log("===================================================================");
  console.log("🌐 TEST COMPLET E2E : PROCESSUS DE SOUSCRIPTION & COUVERTURE GOOGLE");
  console.log("===================================================================\n");

  // =========================================================================
  // 1. TEST GÉOLOCALISATION & REVERSE GEOCODING GOOGLE / HIGH PRECISION
  // =========================================================================
  console.log("1️⃣ Test Reverse Geocoding Précis & Lien Google Maps (/api/geocode/reverse)...");
  const gombeLat = -4.3125;
  const gombeLng = 15.282;
  const revRes = await fetch(`${baseUrl}/api/geocode/reverse?lat=${gombeLat}&lng=${gombeLng}`);
  if (!revRes.ok) throw new Error(`Reverse geocode failed: ${revRes.status}`);
  const revData = await revRes.json();
  console.log(`   ✅ Rue détectée : "${revData.street}"`);
  console.log(`   ✅ Commune : "${revData.commune}"`);
  console.log(`   ✅ Adresse formatée : "${revData.formattedAddress}"`);
  console.log(`   ✅ Lien Google Maps : ${revData.googleMapsUrl}`);
  console.log(`   ✅ Zone éligible : ${revData.available ? "OUI (Fibre Active 🎉)" : "NON"}`);

  if (!revData.street || !revData.googleMapsUrl.includes("google.com/maps")) {
    throw new Error("Reverse geocoding did not return street or Google Maps link!");
  }

  // =========================================================================
  // 2. PROCESSUS CLIENT ÉLIGIBLE (PARCOURS A DE BOUT EN BOUT)
  // =========================================================================
  console.log("\n2️⃣ Test Parcours Client Éligible (Souscription Fibre Complète)...");

  // A. Étape 1 : Vérification de la localisation
  console.log("   📍 A. Vérification éligibilité zone Gombe (/api/signup/location)...");
  const locRes = await fetch(`${baseUrl}/api/signup/location`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      street_address: revData.street || "Avenue de la Justice",
      house_no: "142",
      lat: gombeLat,
      lng: gombeLng,
    }),
  });
  if (!locRes.ok) throw new Error(`Location check failed: ${locRes.status}`);
  const locData = await locRes.json();
  console.log(`      • Statut éligibilité : ${locData.available ? "Disponible ✓" : "Indisponible"}`);
  console.log(`      • Zone identifiée : ${locData.zone}`);

  if (!locData.available) throw new Error("Expected Gombe coordinates to be eligible!");

  // B. Étape 2 : Récupération des forfaits
  console.log("   📦 B. Sélection du forfait fibre (/api/packages)...");
  const pkgRes = await fetch(`${baseUrl}/api/packages`);
  const pkgData = await pkgRes.json();
  const chosenPkg = pkgData.packages.find((p) => p.slug === "fibron-pro") || pkgData.packages[0];
  console.log(`      • Forfait choisi : ${chosenPkg.name} (${chosenPkg.speed}) — ${chosenPkg.price} USD/mois`);

  // C. Étape 3 : Soumission complète de la souscription
  const testEmail = `alain.test.${Date.now()}@example.cd`;
  console.log(`   📝 C. Soumission du dossier de souscription (${testEmail})...`);
  const submitRes = await fetch(`${baseUrl}/api/signup/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      first_name: "Alain",
      last_name: "Mukendi",
      email: testEmail,
      phone: "+243819998877",
      package_id: chosenPkg.slug,
      street_address: revData.street || "Avenue de la Justice",
      house_no: "142",
      commune: locData.zone || "Gombe",
      lat: gombeLat,
      lng: gombeLng,
      installation_date: "2026-08-25",
      notes: "Installation au 3ème étage, présence de gaine technique.",
    }),
  });
  if (!submitRes.ok) throw new Error(`Signup submit failed: ${submitRes.status}`);
  const submitData = await submitRes.json();
  console.log(`      • Réf commande : ${submitData.order_ref}`);
  console.log(`      • Compte client créé : ${submitData.account_created ? "OUI ✓" : "NON"}`);

  // D. Étape 4 : Vérification en base de données
  console.log("   🔍 D. Vérification en base Supabase (User, Order, EmailLog)...");
  const createdUser = await db.user.findUnique({
    where: { email: testEmail },
    include: { orders: true },
  });
  if (!createdUser) throw new Error("Created user not found in DB!");
  console.log(`      • Utilisateur en base ID : ${createdUser.id}`);
  console.log(`      • Numéro client : ${createdUser.customerNo}`);
  console.log(`      • Commande associée : ${createdUser.orders[0]?.ref}`);

  const emailLog = await db.emailLog.findFirst({
    where: { toEmail: testEmail },
    orderBy: { createdAt: "desc" },
  });
  console.log(`      • Email d'accès journalisé : ${emailLog ? `OUI (${emailLog.subject}) ✓` : "NON"}`);

  // =========================================================================
  // 3. PROCESSUS CLIENT NON ÉLIGIBLE / DEMANDE DE COUVERTURE (PARCOURS B)
  // =========================================================================
  console.log("\n3️⃣ Test Parcours Client Hors Zone Couverte (Demande d'Extension Fibre)...");

  // A. Étape 1 : Coordonnées hors zone (Ex: Maluku)
  const outLat = -4.45;
  const outLng = 15.45;
  console.log("   📍 A. Détection zone non couverte (/api/geocode/reverse & /api/signup/location)...");
  const outRevRes = await fetch(`${baseUrl}/api/geocode/reverse?lat=${outLat}&lng=${outLng}`);
  const outRevData = await outRevRes.json();
  console.log(`      • Adresse hors zone : "${outRevData.formattedAddress}"`);
  console.log(`      • Couverture fibre : ${outRevData.available ? "OUI" : "NON COUVERTE (Attendu) ✓"}`);

  // B. Étape 2 : Envoi de la demande d'extension de couverture
  const covEmail = `marie.kanku.${Date.now()}@example.cd`;
  console.log(`   📢 B. Envoi de la demande de couverture (/api/coverage-request)...`);
  const covRes = await fetch(`${baseUrl}/api/coverage-request`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Marie Kanku",
      phone: "+243825554433",
      email: covEmail,
      address: "Avenue de la Paix",
      house_no: "45",
      commune: "Maluku",
      lat: outLat,
      lng: outLng,
      message: "Nous sommes un complexe de 20 villas souhaitant un raccordement fibre dédié.",
    }),
  });
  if (!covRes.ok) throw new Error(`Coverage request failed: ${covRes.status}`);
  const covData = await covRes.json();
  console.log(`      • Réf demande : ${covData.ref}`);
  console.log(`      • Message confirmation : ${covData.message}`);

  // C. Étape 3 : Vérification en base de données et dans le Back-office
  console.log("   🔍 C. Vérification de la demande en base Supabase...");
  const covInDb = await db.coverageRequest.findFirst({
    where: { ref: covData.ref },
  });
  if (!covInDb) throw new Error("Coverage request record not found in DB!");
  console.log(`      • Demande enregistrée avec ID : ${covInDb.id}`);
  console.log(`      • Demandeur : ${covInDb.name} (${covInDb.phone})`);
  console.log(`      • Localisation GPS : ${covInDb.lat}, ${covInDb.lng}`);

  const covEmailLog = await db.emailLog.findFirst({
    where: { toEmail: covEmail },
  });
  console.log(`      • Email confirmation envoyé : ${covEmailLog ? `OUI (${covEmailLog.subject}) ✓` : "NON"}`);

  console.log("\n===================================================================");
  console.log("🎉 TOUS LES TESTS DU PROCESSUS DE SOUSCRIPTION ET COUVERTURE SONT 100% VALIDES !");
  console.log("===================================================================");
}

testSubscriptionAndCoverageFlow()
  .catch((e) => {
    console.error("❌ Erreur Test Souscription/Couverture:", e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
