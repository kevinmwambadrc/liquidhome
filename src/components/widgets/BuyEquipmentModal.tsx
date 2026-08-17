"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/lib/router";
import { initiateMaishaPayCheckout } from "@/lib/maishapay-client";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  ShoppingCart,
  Minus,
  Plus,
  User,
  Phone,
  Mail,
  MapPin,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export interface BuyItem {
  slug: string;
  name: string;
  price: number;
}

export function BuyEquipmentModal({
  open,
  onOpenChange,
  item,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  item: BuyItem | null;
}) {
  const { navigate } = useRouter();
  const [qty, setQty] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMode, setPaymentMode] = useState<"maishapay" | "cod">("maishapay");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState<null | { ok: boolean; msg: string }>(null);
  const [me, setMe] = useState<{ name: string | null; email: string; phone: string | null } | null>(null);

  // Prefill from the session
  useEffect(() => {
    if (!open) return;
    const raf = requestAnimationFrame(() => {
      setDone(null);
      setQty(1);
    });
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (d.user) {
          setMe(d.user);
          setName((prev) => prev || d.user.name || "");
          setEmail((prev) => prev || d.user.email || "");
          setPhone((prev) => prev || d.user.phone || "");
        }
      })
      .catch(() => {});
    return () => cancelAnimationFrame(raf);
  }, [open]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;
    setSending(true);
    setDone(null);
    try {
      const res = await fetch("/api/equipment-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [{ slug: item.slug, qty }],
          buyer_name: name,
          buyer_phone: phone,
          buyer_email: email,
          delivery_address: address,
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        setDone({ ok: false, msg: data.message ?? "Erreur lors de la commande." });
        setSending(false);
        return;
      }

      // If user selected online payment via MaishaPay, redirect to checkout
      if (paymentMode === "maishapay" && data.order?.ref) {
        const payRes = await initiateMaishaPayCheckout({
          type: "equipment",
          order_ref: data.order.ref,
        });
        if (!payRes.ok) {
          setDone({
            ok: true,
            msg: `Commande ${data.order.ref} enregistrée, mais impossible d'ouvrir la passerelle MaishaPay (${payRes.message}). Notre service client vous contactera.`,
          });
          setSending(false);
        }
        return;
      }

      setDone({ ok: true, msg: data.message ?? "" });
      setAddress("");
      if (me) navigate("/myliquid");
    } catch {
      setDone({ ok: false, msg: "Erreur réseau. Réessayez." });
    } finally {
      setSending(false);
    }
  };

  const total = item ? item.price * qty : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-white max-h-[90vh] overflow-y-auto">
        <DialogTitle className="sr-only">Acheter un équipement</DialogTitle>
        <DialogDescription className="sr-only">Commander un équipement Liquid Home</DialogDescription>

        <div className="bg-brand-header-gradient px-6 pt-6 pb-7 text-center">
          <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-white/15 border border-white/25 flex items-center justify-center">
            <ShoppingCart className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white">{item?.name}</h2>
          <p className="text-white/85 text-sm mt-1">
            {item?.price} USD · {qty} × {item?.price} = <b>{total} USD</b>
          </p>
        </div>

        {done ? (
          <div className="p-6 text-center">
            <div className={`mx-auto mb-3 h-14 w-14 rounded-full flex items-center justify-center ${done.ok ? "bg-green-100" : "bg-red-100"}`}>
              {done.ok ? <CheckCircle2 className="h-8 w-8 text-green-600" /> : <AlertCircle className="h-8 w-8 text-red-500" />}
            </div>
            <p className="text-sm text-brand-muted mb-5">{done.msg}</p>
            <div className="flex gap-2 justify-center">
              {done.ok && me && (
                <button onClick={() => navigate("/myliquid")} className="btn-brand">
                  Suivre ma commande
                </button>
              )}
              <button onClick={() => onOpenChange(false)} className={done.ok && me ? "px-6 py-3 rounded-lg border-2 border-brand-navy text-brand-navy font-semibold hover:bg-brand-navy hover:text-white transition-colors" : "btn-brand"}>
                Fermer
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="p-6 space-y-4">
            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-brand-navy mb-2">Quantité</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="h-10 w-10 rounded-lg bg-brand-soft text-brand-navy font-bold hover:bg-gray-200 transition-colors"
                  aria-label="Diminuer"
                >
                  <Minus className="h-4 w-4 mx-auto" />
                </button>
                <span className="text-xl font-bold text-brand-navy w-10 text-center">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.min(20, q + 1))}
                  className="h-10 w-10 rounded-lg bg-brand-soft text-brand-navy font-bold hover:bg-gray-200 transition-colors"
                  aria-label="Augmenter"
                >
                  <Plus className="h-4 w-4 mx-auto" />
                </button>
                <span className="ml-auto text-sm text-brand-muted">
                  Total : <b className="text-brand-orange text-lg">{total} USD</b>
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-navy mb-2">Nom complet <span className="text-brand-orange">*</span></label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-muted" />
                <input value={name} onChange={(e) => setName(e.target.value)} required className="input-brand pl-10" placeholder="Jean Mutombo" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-navy mb-2">Téléphone <span className="text-brand-orange">*</span></label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-muted" />
                <input value={phone} onChange={(e) => setPhone(e.target.value)} required className="input-brand pl-10" placeholder="+243 81 000 00 00" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-navy mb-2">Email <span className="text-brand-orange">*</span></label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-muted" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="input-brand pl-10" placeholder="vous@exemple.cd" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-navy mb-2">Adresse de livraison <span className="text-brand-orange">*</span></label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-brand-muted" />
                <textarea value={address} onChange={(e) => setAddress(e.target.value)} required rows={2} className="input-brand pl-10 resize-y" placeholder="Quartier, avenue, n°, commune" />
              </div>
            </div>

            {/* Payment Method Option */}
            <div>
              <label className="block text-sm font-medium text-brand-navy mb-2">Mode de règlement</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMode("maishapay")}
                  className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all ${
                    paymentMode === "maishapay"
                      ? "border-brand-orange bg-orange-50 text-brand-navy shadow-sm"
                      : "border-gray-200 text-brand-muted hover:border-brand-orange/40"
                  }`}
                >
                  <span className="block font-bold text-brand-navy mb-0.5">En ligne (MaishaPay)</span>
                  <span className="text-[10px] text-brand-muted">M-Pesa, Orange, Airtel, Carte</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMode("cod")}
                  className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all ${
                    paymentMode === "cod"
                      ? "border-brand-navy bg-brand-navy/5 text-brand-navy shadow-sm"
                      : "border-gray-200 text-brand-muted hover:border-brand-navy/40"
                  }`}
                >
                  <span className="block font-bold text-brand-navy mb-0.5">À la livraison</span>
                  <span className="text-[10px] text-brand-muted">Mobile Money ou espèces</span>
                </button>
              </div>
            </div>

            <button type="submit" disabled={sending} className="btn-brand btn-brand-block btn-brand-lg">
              {sending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {paymentMode === "maishapay" ? "Redirection MaishaPay..." : "Traitement..."}
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4" />
                  {paymentMode === "maishapay" ? `Payer via MaishaPay — ${total} USD` : `Commander — ${total} USD`}
                </>
              )}
            </button>
            <p className="text-[11px] text-brand-muted text-center">
              {paymentMode === "maishapay"
                ? "Paiement sécurisé par MaishaPay. Vous serez redirigé vers la passerelle de paiement."
                : "Paiement à la livraison. Notre équipe vous contactera pour organiser l'acheminement."}
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
