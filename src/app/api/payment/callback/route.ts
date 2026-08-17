import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isMaishaPaySuccess, isMaishaPayPending } from "@/lib/maishapay";
import { refCode } from "@/lib/auth";
import { sendEmail, topupEmail, orderConfirmationEmail } from "@/lib/mailer";

async function handlePaymentCallback(req: NextRequest) {
  const url = new URL(req.url);
  const searchParams = url.searchParams;

  // Collect data from query string
  let status = searchParams.get("status");
  let description = searchParams.get("description");
  let transactionRefId = searchParams.get("transactionRefId") || searchParams.get("transaction_ref_id");
  let operatorRefId = searchParams.get("operatorRefId") || searchParams.get("operator_ref_id");

  const txRef = searchParams.get("tx_ref");
  const type = searchParams.get("type");
  const invoiceId = searchParams.get("invoice_id");
  const packageSlug = searchParams.get("package_slug");
  const userId = searchParams.get("user_id");
  const orderRef = searchParams.get("order_ref");

  // If POST, also check body
  let bodyData: Record<string, unknown> = {};
  if (req.method === "POST") {
    try {
      const contentType = req.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        bodyData = await req.json();
      } else if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
        const formData = await req.formData();
        bodyData = Object.fromEntries(formData.entries());
      }
      status = (bodyData.status as string) || status;
      description = (bodyData.description as string) || description;
      transactionRefId = (bodyData.transactionRefId as string) || (bodyData.transaction_ref_id as string) || transactionRefId;
      operatorRefId = (bodyData.operatorRefId as string) || (bodyData.operator_ref_id as string) || operatorRefId;
    } catch {}
  }

  const isSuccess = isMaishaPaySuccess(status, description);
  const isPending = isMaishaPayPending(status, description);
  const finalStatus = isSuccess ? "completed" : isPending ? "pending" : "failed";

  // Update PaymentTransaction log
  if (txRef) {
    await db.paymentTransaction.updateMany({
      where: { ref: txRef },
      data: {
        status: finalStatus,
        description: description || `Status: ${status}`,
        transactionRef: transactionRefId,
        operatorRef: operatorRefId,
        rawResponse: JSON.stringify({ status, description, transactionRefId, operatorRefId, bodyData }),
      },
    });
  }

  // Handle business logic on success
  if (isSuccess) {
    if (type === "invoice" && invoiceId) {
      const invoice = await db.invoice.findUnique({
        where: { id: invoiceId },
        include: { user: true },
      });
      if (invoice && invoice.status !== "paid") {
        await db.invoice.update({
          where: { id: invoice.id },
          data: {
            status: "paid",
            method: "maishapay",
            transactionRef: transactionRefId,
            operatorRef: operatorRefId,
            paidAt: new Date(),
          },
        });

        if (invoice.user?.email) {
          await sendEmail({
            to: invoice.user.email,
            subject: `Reçu de paiement — Facture ${invoice.number}`,
            html: topupEmail({
              name: invoice.user.name || invoice.user.email,
              amount: invoice.amount,
              period: invoice.period,
              method: "maishapay",
            }),
            kind: "invoice-receipt",
          }).catch(() => {});
        }
      }
    } else if (type === "topup" && packageSlug && userId) {
      const user = await db.user.findUnique({ where: { id: userId } });
      const pkg = await db.package.findFirst({ where: { slug: packageSlug } });

      if (user && pkg) {
        const periodDate = new Date();
        periodDate.setMonth(periodDate.getMonth() + 1);
        const period = periodDate.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
        const dueAt = new Date();
        dueAt.setDate(dueAt.getDate() + 30);

        const newInvoice = await db.invoice.create({
          data: {
            number: refCode("INV"),
            userId: user.id,
            amount: pkg.price,
            status: "paid",
            method: "maishapay",
            transactionRef: transactionRefId,
            operatorRef: operatorRefId,
            paidAt: new Date(),
            period,
            dueAt,
          },
        });

        await sendEmail({
          to: user.email,
          subject: `Reçu de réabonnement ${newInvoice.number}`,
          html: topupEmail({
            name: user.name ?? user.email,
            amount: pkg.price,
            period,
            method: "maishapay",
          }),
          kind: "topup",
        }).catch(() => {});
      }
    } else if (type === "equipment" && orderRef) {
      const eqOrder = await db.equipmentOrder.findUnique({ where: { ref: orderRef } });
      if (eqOrder) {
        await db.equipmentOrder.update({
          where: { id: eqOrder.id },
          data: {
            paymentStatus: "paid",
            status: "confirmed",
            transactionRef: transactionRefId,
            operatorRef: operatorRefId,
          },
        });

        if (eqOrder.buyerEmail) {
          const items = JSON.parse(eqOrder.items || "[]");
          await sendEmail({
            to: eqOrder.buyerEmail,
            subject: `Paiement reçu — Commande équipement ${eqOrder.ref}`,
            html: orderConfirmationEmail({
              name: eqOrder.buyerName,
              ref: eqOrder.ref,
              items,
              total: eqOrder.total,
            }),
            kind: "order-paid",
          }).catch(() => {});
        }
      }
    }
  }

  // Response for browser navigation (GET) vs webhook (POST)
  if (req.method === "GET") {
    const origin = url.origin;
    if (isSuccess) {
      if (type === "equipment") {
        return NextResponse.redirect(
          new URL(`/produits-et-services?payment=success&ref=${encodeURIComponent(orderRef || "")}`, origin)
        );
      }
      return NextResponse.redirect(
        new URL(
          `/myliquid?payment=success&ref=${encodeURIComponent(transactionRefId || txRef || "")}`,
          origin
        )
      );
    } else {
      const desc = description || (isPending ? "Paiement en attente de validation" : "Paiement non complété");
      return NextResponse.redirect(
        new URL(`/myliquid?payment=failed&desc=${encodeURIComponent(desc)}`, origin)
      );
    }
  }

  return NextResponse.json({
    ok: true,
    status: finalStatus,
    transactionRef: transactionRefId,
    operatorRef: operatorRefId,
  });
}

export async function GET(req: NextRequest) {
  return handlePaymentCallback(req);
}

export async function POST(req: NextRequest) {
  return handlePaymentCallback(req);
}
