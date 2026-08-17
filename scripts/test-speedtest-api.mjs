import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const baseUrl = "http://localhost:3000";

async function testSpeedTestAPI() {
  console.log("=================================================");
  console.log("⚡ TEST COMPLET DE L'API SPEED TEST REEL LIQUID");
  console.log("=================================================\n");

  // 1. Test Ping Endpoint
  console.log("1️⃣ Test Ping & Latence (/api/speedtest/ping)...");
  const pStart = performance.now();
  const pingRes = await fetch(`${baseUrl}/api/speedtest/ping`);
  const pEnd = performance.now();
  if (!pingRes.ok) throw new Error(`Ping failed: ${pingRes.status}`);
  const pingData = await pingRes.json();
  console.log(`   ✅ Ping RTT : ${(pEnd - pStart).toFixed(1)} ms`);
  console.log(`   ✅ Serveur : ${pingData.server}`);
  console.log(`   ✅ Fournisseur : ${pingData.isp}`);
  console.log(`   ✅ IP Client : ${pingData.ip}`);

  // 2. Test Servers List Endpoint
  console.log("\n2️⃣ Test Liste des Serveurs / POPs (/api/speedtest/servers)...");
  const serversRes = await fetch(`${baseUrl}/api/speedtest/servers`);
  if (!serversRes.ok) throw new Error(`Servers failed: ${serversRes.status}`);
  const serversData = await serversRes.json();
  console.log(`   ✅ POPs disponibles : ${serversData.servers.length}`);
  serversData.servers.forEach((s) => {
    console.log(`      • ${s.flag} ${s.name} (${s.sponsor})`);
  });

  // 3. Test Download Stream Endpoint
  console.log("\n3️⃣ Test Flux de Téléchargement Réel (/api/speedtest/download)...");
  const testBytes = 5 * 1024 * 1024; // 5 MB
  const dlStart = performance.now();
  const dlRes = await fetch(`${baseUrl}/api/speedtest/download?bytes=${testBytes}`);
  if (!dlRes.ok) throw new Error(`Download failed: ${dlRes.status}`);
  const arrayBuffer = await dlRes.arrayBuffer();
  const dlEnd = performance.now();
  const dlDurationSec = (dlEnd - dlStart) / 1000;
  const dlMbps = Number(((arrayBuffer.byteLength * 8) / (dlDurationSec * 1000 * 1000)).toFixed(2));
  console.log(`   ✅ Octets téléchargés : ${(arrayBuffer.byteLength / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`   ✅ Durée : ${dlDurationSec.toFixed(3)} s`);
  console.log(`   ✅ Débit mesuré : ${dlMbps} Mbps`);

  // 4. Test Upload Stream Endpoint
  console.log("\n4️⃣ Test Flux d'Envoi Réel (/api/speedtest/upload)...");
  const uploadPayload = new Uint8Array(2 * 1024 * 1024); // 2 MB
  const ulStart = performance.now();
  const ulRes = await fetch(`${baseUrl}/api/speedtest/upload`, {
    method: "POST",
    headers: { "Content-Type": "application/octet-stream" },
    body: uploadPayload,
  });
  if (!ulRes.ok) throw new Error(`Upload failed: ${ulRes.status}`);
  const ulData = await ulRes.json();
  const ulEnd = performance.now();
  const ulDurationSec = (ulEnd - ulStart) / 1000;
  const ulMbps = Number(((uploadPayload.byteLength * 8) / (ulDurationSec * 1000 * 1000)).toFixed(2));
  console.log(`   ✅ Octets envoyés : ${(ulData.receivedBytes / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`   ✅ Durée serveur : ${ulData.durationMs} ms (Client : ${(ulDurationSec * 1000).toFixed(1)} ms)`);
  console.log(`   ✅ Débit montant mesuré : ${ulMbps} Mbps`);

  // 5. Test Saving Result to Supabase DB
  console.log("\n5️⃣ Test Enregistrement du résultat en base Supabase (/api/speedtest/results)...");
  const saveRes = await fetch(`${baseUrl}/api/speedtest/results`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ping: 8.5,
      jitter: 1.2,
      downloadMbps: dlMbps,
      uploadMbps: ulMbps,
      server: "Liquid Home Kinshasa Core",
      clientIp: pingData.ip,
      isp: "Liquid Intelligent Technologies RDC",
      rating: "ultra",
    }),
  });
  if (!saveRes.ok) throw new Error(`Save result failed: ${saveRes.status}`);
  const saveData = await saveRes.json();
  console.log(`   ✅ Résultat enregistré avec ID : ${saveData.result.id}`);

  // 6. Test Fetching Results History
  console.log("\n6️⃣ Test Récupération de l'historique (/api/speedtest/results)...");
  const getResultsRes = await fetch(`${baseUrl}/api/speedtest/results`);
  if (!getResultsRes.ok) throw new Error(`Get results failed: ${getResultsRes.status}`);
  const getResultsData = await getResultsRes.json();
  console.log(`   ✅ Nombre de tests enregistrés : ${getResultsData.stats.totalTests}`);
  console.log(`   ✅ Moyenne téléchargement : ${getResultsData.stats.avgDownload} Mbps`);
  console.log(`   ✅ Moyenne envoi : ${getResultsData.stats.avgUpload} Mbps`);
  console.log(`   ✅ Moyenne ping : ${getResultsData.stats.avgPing} ms`);

  console.log("\n=================================================");
  console.log("🎉 TOUTES LES ROUTES DE L'API SPEED TEST SONT 100% OPÉRATIONNELLES !");
  console.log("=================================================");
}

testSpeedTestAPI()
  .catch((e) => {
    console.error("❌ Erreur SpeedTest API:", e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
