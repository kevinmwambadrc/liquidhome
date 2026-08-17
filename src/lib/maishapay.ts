/**
 * MaishaPay Payment Gateway Service (Sandbox / Live)
 * Official checkout endpoint: https://marchand.maishapay.online/payment/vers1.0/merchant/checkout
 */

export const MAISHAPAY_CHECKOUT_URL =
  "https://marchand.maishapay.online/payment/vers1.0/merchant/checkout";

export interface MaishaPayConfig {
  publicKey: string;
  secretKey: string;
  gatewayMode: "0" | "1"; // "0" = Sandbox (Test), "1" = Live (Production)
  appUrl: string;
}

export function getMaishaPayConfig(): MaishaPayConfig {
  const publicKey =
    process.env.MAISHAPAY_PUBLIC_KEY ||
    "MP-SBPK-wWsiV3YTM$6W0ni1yuyyKf41WLg0fQQQFdu0U9EEi2yQd0.u$TP9qVZrQb5N$UzN0mJ7$S1wc1CH4c/eOPe/8jBqM2J6mWds3KinM9$0PzNrIma0$rG.FOtw";
  const secretKey =
    process.env.MAISHAPAY_SECRET_KEY ||
    "MP-SBSK-8QZBr$I.ODQuVqqEz.fm$hRMIj$$iI4ltn8z1$pDam1ej$W13Mg70HBvZB1btkfWjbDJ9uGRXbXCqCV1d2tyu0anTK2AG3dW2p6FjEWNujOjhFXyyvLd3oj2";
  const gatewayMode = (process.env.MAISHAPAY_GATEWAY_MODE === "1" ? "1" : "0") as "0" | "1";
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");

  return {
    publicKey,
    secretKey,
    gatewayMode,
    appUrl,
  };
}

export interface CheckoutPayload {
  montant: number;
  devise?: "USD" | "CDF" | "CFA" | "EUR";
  callbackUrl: string;
}

export interface MaishaPayFormFields {
  gatewayMode: "0" | "1";
  publicApiKey: string;
  secretApiKey: string;
  montant: string;
  devise: string;
  callbackUrl: string;
}

/**
 * Builds the required form fields to submit to MaishaPay checkout endpoint.
 */
export function buildMaishaPayCheckoutFields(
  payload: CheckoutPayload,
  config = getMaishaPayConfig()
): { actionUrl: string; fields: MaishaPayFormFields } {
  return {
    actionUrl: MAISHAPAY_CHECKOUT_URL,
    fields: {
      gatewayMode: config.gatewayMode,
      publicApiKey: config.publicKey,
      secretApiKey: config.secretKey,
      montant: Number(payload.montant).toFixed(2),
      devise: payload.devise || "USD",
      callbackUrl: payload.callbackUrl,
    },
  };
}

/**
 * Evaluates whether a MaishaPay callback indicates success.
 */
export function isMaishaPaySuccess(status?: string | null, description?: string | null): boolean {
  if (!status && !description) return false;
  const s = String(status || "").trim();
  const desc = String(description || "").trim().toUpperCase();

  const isStatusSuccess = s === "200" || s === "202";
  const isDescSuccess = desc === "ACCEPTED" || desc === "APPROVED" || desc === "SUCCESS";

  return isStatusSuccess || isDescSuccess;
}

export function isMaishaPayPending(status?: string | null, description?: string | null): boolean {
  const desc = String(description || "").trim().toUpperCase();
  return desc === "PENDING" || desc === "ON-HOLD";
}
