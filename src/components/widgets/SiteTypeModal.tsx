"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Home, Building2, X } from "lucide-react";
import { useRouter } from "@/lib/router";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const STORAGE_KEY = "liquidhome-sitetype-seen";

export function SiteTypeModal() {
  const [open, setOpen] = useState(false);
  const { setSiteType, navigate } = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const seen = window.localStorage.getItem(STORAGE_KEY);
    if (!seen) {
      const t = setTimeout(() => setOpen(true), 1200);
      return () => clearTimeout(t);
    }
  }, []);

  const choose = (t: "home" | "business") => {
    setSiteType(t);
    navigate(t);
    setOpen(false);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, "1");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-white [&>button]:hidden">
        <DialogTitle className="sr-only">Bienvenue chez Liquid Home RDC</DialogTitle>
        <DialogDescription className="sr-only">
          Choisissez votre profil pour une expérience personnalisée
        </DialogDescription>
        <div className="bg-brand-header-gradient px-6 pt-6 pb-8 text-center relative">
          <button
            onClick={() => setOpen(false)}
            className="absolute top-3 right-3 text-white/80 hover:text-white"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex justify-center mb-4">
            <Image
              src="/img/colour_liquid_home2.png"
              alt="Liquid Home"
              width={180}
              height={56}
              className="h-14 w-auto"
              style={{ width: "auto", height: "3.5rem" }}
            />
          </div>
          <h2 className="text-xl font-bold text-white">Bienvenue chez Liquid Home RDC</h2>
          <p className="text-white/85 text-sm mt-1">
            Choisissez votre profil pour une expérience personnalisée
          </p>
        </div>

        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => choose("home")}
            className="flex flex-col items-center gap-2 p-5 rounded-lg border-2 border-gray-200 hover:border-brand-orange hover:bg-orange-50 transition-all group"
          >
            <div className="h-12 w-12 rounded-full bg-brand-navy group-hover:bg-brand-orange flex items-center justify-center text-white transition-colors">
              <Home className="h-6 w-6" />
            </div>
            <span className="font-semibold text-brand-navy">Domicile</span>
            <span className="text-xs text-gray-500 text-center">Internet fibre pour la maison</span>
          </button>

          <button
            onClick={() => choose("business")}
            className="flex flex-col items-center gap-2 p-5 rounded-lg border-2 border-gray-200 hover:border-brand-orange hover:bg-orange-50 transition-all group"
          >
            <div className="h-12 w-12 rounded-full bg-brand-navy group-hover:bg-brand-orange flex items-center justify-center text-white transition-colors">
              <Building2 className="h-6 w-6" />
            </div>
            <span className="font-semibold text-brand-navy text-center text-sm leading-tight">
              Petite et Moyenne Enterprise
            </span>
            <span className="text-xs text-gray-500 text-center">Solutions pro pour entreprises</span>
          </button>
        </div>

        <div className="px-6 pb-6 text-center">
          <button
            onClick={() => setOpen(false)}
            className="text-xs text-gray-500 hover:text-brand-navy"
          >
            Continuer sans choisir →
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
