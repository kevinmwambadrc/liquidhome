// Seed script: admin account, demo client with order/invoices/ticket.
// Run with: node scripts/seed.mjs
import { PrismaClient } from "@prisma/client";
import { randomBytes, scryptSync } from "crypto";

const prisma = new PrismaClient();

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

async function main() {
  // Wipe demo data so the seed is idempotent
  await prisma.session.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.complaint.deleteMany();
  await prisma.order.deleteMany();
  await prisma.contactMessage.deleteMany();
  await prisma.newsletterSubscriber.deleteMany();
  await prisma.user.deleteMany();

  const admin = await prisma.user.create({
    data: {
      email: "admin@liquid.tech",
      name: "Administrateur Liquid",
      role: "admin",
      phone: "+243 90 300 39 00",
      customerNo: "LH000001",
      passwordHash: hashPassword("Admin1234"),
    },
  });
  console.log("Admin créé:", admin.email);

  const client = await prisma.user.create({
    data: {
      email: "jean@demo.cd",
      name: "Jean Mutombo",
      role: "client",
      phone: "+243 81 234 56 78",
      customerNo: "LH284591",
      passwordHash: hashPassword("Client1234"),
    },
  });
  console.log("Client démo créé:", client.email);

  const order = await prisma.order.create({
    data: {
      ref: "LH-DEMO-0001",
      userId: client.id,
      firstName: "Jean",
      lastName: "Mutombo",
      email: client.email,
      phone: client.phone,
      packageId: "libota-super",
      packagePrice: 89,
      streetAddress: "12, Avenue de la Justice",
      houseNo: "142",
      commune: "Gombe",
      lat: -4.3205,
      lng: 15.287,
      installationDate: new Date().toISOString().slice(0, 10),
      status: "installed",
    },
  });
  console.log("Commande démo créée:", order.ref);

  const now = new Date();
  const months = ["Juillet 2026", "Août 2026"];
  for (let i = 0; i < 2; i++) {
    const issued = new Date(now);
    issued.setMonth(issued.getMonth() - (1 - i));
    const due = new Date(issued);
    due.setDate(due.getDate() + 15);
    await prisma.invoice.create({
      data: {
        number: `INV-2026-00${i + 1}`,
        userId: client.id,
        orderRef: order.ref,
        amount: 89,
        status: i === 0 ? "paid" : "unpaid",
        method: i === 0 ? "mobile-money" : null,
        period: months[i],
        issuedAt: issued,
        dueAt: due,
      },
    });
  }
  console.log("2 factures créées");

  await prisma.ticket.create({
    data: {
      ref: "SUP-DEMO-01",
      userId: client.id,
      subject: "Vitesse instable le soir",
      message: "Bonjour, depuis quelques jours le débit baisse entre 20h et 22h. Merci d'intervenir.",
      status: "in-progress",
    },
  });
  console.log("Ticket démo créé");

  await prisma.complaint.create({
    data: {
      ticket: "TKT-DEMO-01",
      name: "Grace Kabila",
      email: "grace.kabila@demo.cd",
      telephone: "+243 82 111 22 33",
      message: "Coupure de connexion depuis mardi à Limete.",
      status: "open",
    },
  });

  await prisma.contactMessage.create({
    data: {
      firstName: "Patrick",
      lastName: "Ilunga",
      email: "patrick.ilunga@demo.cd",
      telephone: "+243 99 555 44 33",
      city: "Kinshasa",
      areaOfInterest: "business",
      requirements: "Devis pour une connexion fibre 300 Mbps dans nos bureaux de la Gombe.",
    },
  });

  await prisma.newsletterSubscriber.create({
    data: { email: "abo1@demo.cd", name: "Abo One" },
  });

  console.log("Seed terminé ✓");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
