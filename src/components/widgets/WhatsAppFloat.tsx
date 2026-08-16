"use client";

import { useState } from "react";
import { MessageCircle, X, Phone } from "lucide-react";
import { CONTACT_INFO } from "@/lib/content";

export function WhatsAppFloat() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      {open && (
        <div className="bg-white rounded-lg shadow-2xl border border-gray-200 w-72 overflow-hidden animate-fade-up">
          <div className="bg-[#25D366] text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              <div>
                <p className="font-semibold text-sm">Liquid Home RDC</p>
                <p className="text-xs text-white/90">Service client en ligne</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Fermer"
              className="text-white/90 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="p-4 bg-[#ECE5DD]">
            <div className="bg-white rounded-lg p-3 text-sm text-gray-800 shadow-sm">
              Bonjour 👋 ! Comment pouvons-nous vous aider aujourd'hui ? Notre équipe est disponible de 8h à 22h.
            </div>
            <div className="mt-3 flex flex-col gap-2">
              <a
                href={CONTACT_INFO.whatsappChat}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-brand btn-brand-block text-sm"
              >
                <MessageCircle className="h-4 w-4" />
                Discuter sur WhatsApp
              </a>
              <a
                href={`tel:${CONTACT_INFO.shortPhone}`}
                className="flex items-center justify-center gap-2 text-sm font-semibold text-brand-navy hover:text-brand-orange transition-colors"
              >
                <Phone className="h-4 w-4" />
                Appeler le {CONTACT_INFO.shortPhone}
              </a>
            </div>
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Contacter le service client"
        className={`wa-float h-14 w-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-xl hover:bg-[#1da851] transition-colors ${
          open ? "rotate-90" : ""
        }`}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-7 w-7" />}
      </button>
    </div>
  );
}
