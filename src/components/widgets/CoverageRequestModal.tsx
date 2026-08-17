"use client";

import { useState } from "react";
import { useRouter } from "@/lib/router";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { MapPin, Phone, Mail, MessageSquare, Loader2, Send, CheckCircle2, AlertCircle } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  address?: string;
  houseNo?: string;
  lat?: number | null;
  lng?: number | null;
  commune?: string | null;
}

export function CoverageRequestModal({ open, onOpenChange, address = "", houseNo = "", lat, lng, commune }: Props) {
  const { t } = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState<null | { ok: boolean; msg: string }>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setDone(null);
    try {
      const res = await fetch("/api/coverage-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          email,
          message,
          address: address || name,
          house_no: houseNo,
          commune: commune ?? undefined,
          lat: lat ?? undefined,
          lng: lng ?? undefined,
        }),
      });
      const data = await res.json();
      setDone({ ok: !!data.ok, msg: data.message ?? "" });
      if (data.ok) {
        setName("");
        setPhone("");
        setEmail("");
        setMessage("");
      }
    } catch {
      setDone({ ok: false, msg: "Erreur réseau. Réessayez." });
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-white max-h-[90vh] overflow-y-auto">
        <DialogTitle className="sr-only">{t("covreq.title")}</DialogTitle>
        <DialogDescription className="sr-only">{t("covreq.sub")}</DialogDescription>

        <div className="bg-brand-header-gradient px-6 pt-6 pb-7 text-center relative">
          <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-white/15 border border-white/25 flex items-center justify-center">
            <MapPin className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white">{t("covreq.title")}</h2>
          <p className="text-white/85 text-sm mt-1">{t("covreq.sub")}</p>
          {address && (
            <p className="mt-2 inline-block text-xs bg-white/15 border border-white/20 rounded-full px-3 py-1 text-white/90">
              📍 {address}{houseNo ? `, n° ${houseNo}` : ""}
            </p>
          )}
        </div>

        {done ? (
          <div className="p-6 text-center">
            <div className={`mx-auto mb-3 h-14 w-14 rounded-full flex items-center justify-center ${done.ok ? "bg-green-100" : "bg-red-100"}`}>
              {done.ok ? <CheckCircle2 className="h-8 w-8 text-green-600" /> : <AlertCircle className="h-8 w-8 text-red-500" />}
            </div>
            <p className="text-sm text-brand-muted mb-5">{done.msg}</p>
            <button onClick={() => onOpenChange(false)} className="btn-brand">
              OK
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-brand-navy mb-2">
                {t("covreq.name")} <span className="text-brand-orange">*</span>
              </label>
              <input value={name} onChange={(e) => setName(e.target.value)} required className="input-brand" placeholder="Jean Mutombo" />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-navy mb-2">
                {t("covreq.phone")} <span className="text-brand-orange">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-muted" />
                <input value={phone} onChange={(e) => setPhone(e.target.value)} required className="input-brand pl-10" placeholder="+243 81 000 00 00" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-navy mb-2">{t("covreq.email")}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-muted" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-brand pl-10" placeholder="vous@exemple.cd" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-navy mb-2">{t("covreq.message")}</label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-brand-muted" />
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} className="input-brand pl-10 resize-y" placeholder={t("covreq.messagePh")} />
              </div>
            </div>

            <button type="submit" disabled={sending} className="btn-brand btn-brand-block btn-brand-lg">
              {sending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("covreq.sending")}
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  {t("covreq.send")}
                </>
              )}
            </button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
