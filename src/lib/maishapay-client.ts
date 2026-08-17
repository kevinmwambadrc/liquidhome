"use client";

/**
 * Initiates MaishaPay checkout by calling the backend /api/payment/checkout endpoint
 * and auto-submitting the signed HTML form to MaishaPay hosted checkout.
 */
export async function initiateMaishaPayCheckout(payload: {
  type: "invoice" | "topup" | "equipment";
  invoice_id?: string;
  package_slug?: string;
  order_ref?: string;
}): Promise<{ ok: boolean; message?: string }> {
  try {
    const res = await fetch("/api/payment/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!data.ok || !data.actionUrl || !data.fields) {
      return {
        ok: false,
        message: data.message || "Impossible d'initialiser le paiement MaishaPay.",
      };
    }

    // Build hidden form and submit
    const form = document.createElement("form");
    form.method = "POST";
    form.action = data.actionUrl;
    form.style.display = "none";

    for (const [key, value] of Object.entries(data.fields)) {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = String(value);
      form.appendChild(input);
    }

    document.body.appendChild(form);
    form.submit();

    return { ok: true };
  } catch (error) {
    console.error("MaishaPay checkout initialization error:", error);
    return { ok: false, message: "Erreur de connexion avec la passerelle de paiement." };
  }
}
