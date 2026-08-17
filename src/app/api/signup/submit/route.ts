import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, refCode, getCurrentUser, generateTempPassword, syncUserToSupabaseAuth } from "@/lib/auth";
import { sendEmail, credentialsEmail } from "@/lib/mailer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const first_name = (body?.first_name ?? "").toString().trim();
    const last_name = (body?.last_name ?? "").toString().trim();
    const email = (body?.email ?? "").toString().trim().toLowerCase();
    const phone = (body?.phone ?? "").toString().trim();
    const package_id = (body?.package_id ?? "").toString();
    const street_address = (body?.street_address ?? "").toString().trim();
    const house_no = (body?.house_no ?? "").toString().trim();
    const installation_date = (body?.installation_date ?? "").toString();
    const notes = (body?.notes ?? "").toString().trim().slice(0, 1000);
    const commune = (body?.commune ?? "").toString() || null;
    const kycDocType = (body?.kyc_doc_type ?? "").toString();
    const kycDocUrl = (body?.kyc_doc_url ?? "").toString();
    const KYC_TYPES = ["passport", "voter", "license", "other"];
    if (kycDocType && !KYC_TYPES.includes(kycDocType)) {
      return NextResponse.json({ ok: false, message: "Type de pièce d'identité invalide." }, { status: 400 });
    }
    if (kycDocType && !kycDocUrl.startsWith("/uploads/kyc/")) {
      return NextResponse.json({ ok: false, message: "Pièce d'identité invalide." }, { status: 400 });
    }
    const lat = Number.isFinite(Number(body?.lat)) ? Number(body?.lat) : null;
    const lng = Number.isFinite(Number(body?.lng)) ? Number(body?.lng) : null;

    if (!first_name || !last_name || !email || !phone || !package_id || !street_address || !house_no) {
      return NextResponse.json(
        { ok: false, message: "Champs obligatoires manquants." },
        { status: 400 }
      );
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ ok: false, message: "Adresse email invalide." }, { status: 400 });
    }
    const pkgRow = await db.package.findFirst({
      where: { OR: [{ id: package_id }, { slug: package_id }], active: true },
    });
    if (!pkgRow) {
      return NextResponse.json({ ok: false, message: "Forfait inconnu." }, { status: 400 });
    }
    const pkg = { id: pkgRow.slug, name: pkgRow.name, price: pkgRow.price };

    // Reuse the signed-in account, or create one with a temporary password
    // that the subscriber receives by email and must reset at first login.
    let user = await getCurrentUser();
    let accountCreated = false;
    let tempPassword: string | null = null;
    if (!user) {
      const existing = await db.user.findUnique({ where: { email } });
      if (existing) {
        user = existing;
      } else {
        tempPassword = generateTempPassword();
        user = await db.user.create({
          data: {
            email,
            name: `${first_name} ${last_name}`,
            phone,
            passwordHash: hashPassword(tempPassword),
            customerNo: `LH${Math.floor(100000 + Math.random() * 900000)}`,
            mustResetPassword: true,
            kycStatus: kycDocType ? "pending" : null,
            kycDocType: kycDocType || null,
            kycDocUrl: kycDocUrl || null,
          },
        });
        accountCreated = true;
        // Sync to Supabase Auth table as well
        await syncUserToSupabaseAuth(email, `${first_name} ${last_name}`, "client", tempPassword);
      }
    }

    const orderRef = refCode("LH");
    const order = await db.order.create({
      data: {
        ref: orderRef,
        userId: user?.id ?? null,
        firstName: first_name,
        lastName: last_name,
        email,
        phone,
        packageId: pkg.id,
        packagePrice: pkg.price,
        streetAddress: street_address,
        houseNo: house_no,
        commune,
        lat,
        lng,
        installationDate: installation_date || null,
        notes: notes || null,
      },
    });

    // Email the credentials + order summary (logged in the admin outbox,
    // actually delivered when SMTP_URL is configured).
    if (accountCreated && tempPassword) {
      await sendEmail({
        to: email,
        subject: `Votre accès MyLiquid — commande ${order.ref}`,
        html: credentialsEmail({
          name: `${first_name} ${last_name}`,
          email,
          tempPassword,
          customerNo: user?.customerNo,
          orderRef: order.ref,
          planName: pkg.name,
          price: pkg.price,
          address: `${street_address}, n° ${house_no}`,
        }),
        kind: "credentials",
      }).catch(() => {});
    }

    return NextResponse.json({
      ok: true,
      order_ref: order.ref,
      account_created: accountCreated,
      message: `Commande ${order.ref} enregistrée pour ${first_name} ${last_name}. Forfait ${pkg.name} à installer ${installation_date || "à définir"} au ${street_address}, ${house_no}.`,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { ok: false, message: "Erreur serveur. Réessayez plus tard." },
      { status: 500 }
    );
  }
}
