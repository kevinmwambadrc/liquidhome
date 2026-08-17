"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { useRouter as useNextRouter } from "next/navigation";
import { Lang, translate } from "@/lib/i18n";

/** Canonical site paths — one real page per entry. */
export const PATHS = {
  home: "/",
  business: "/business",
  productsAndServices: "/produits-et-services",
  businessProductsAndServices: "/business/produits-et-services",
  packages: "/packages",
  contact: "/contact",
  signup: "/souscrire",
  myliquid: "/myliquid",
  admin: "/admin",
  privacy: "/confidentialite",
  cookies: "/cookies",
  usage: "/utilisation",
  terms: "/conditions-generales",
} as const;

export type LegalRoute = "privacy" | "cookies" | "usage" | "terms";

export const LEGAL_ROUTES: LegalRoute[] = ["privacy", "cookies", "usage", "terms"];

export type SiteType = "home" | "business";
export type Language = Lang;

interface SiteState {
  siteType: SiteType;
  language: Language;
  signupPackage?: string;
  setSiteType: (t: SiteType) => void;
  setLanguage: (l: Language) => void;
  setSignupPackage: (p?: string) => void;
  /** Navigate to a real path, e.g. navigate("/contact"). */
  navigate: (path: string) => void;
  /** Translate a UI key using the active language. */
  t: (key: string) => string;
}

const SiteContext = createContext<SiteState | null>(null);

export function SiteProvider({ children }: { children: ReactNode }) {
  const nextRouter = useNextRouter();
  const [siteType, setSiteTypeState] = useState<SiteType>("home");
  const [language, setLanguageState] = useState<Language>("fr");
  const [signupPackage, setSignupPackage] = useState<string | undefined>(undefined);

  // Restore persisted site type / language after mount (SSR-safe)
  useEffect(() => {
    try {
      const st = window.localStorage.getItem("lh-site-type");
      const lg = window.localStorage.getItem("lh-language");
      if (st || lg) {
        queueMicrotask(() => {
          if (st === "home" || st === "business") setSiteTypeState(st);
          if (lg === "fr" || lg === "en") setLanguageState(lg);
        });
      }
    } catch {}
  }, []);

  const setSiteType = useCallback((ty: SiteType) => {
    setSiteTypeState(ty);
    try {
      window.localStorage.setItem("lh-site-type", ty);
    } catch {}
  }, []);

  const setLanguage = useCallback((l: Language) => {
    setLanguageState(l);
    try {
      window.localStorage.setItem("lh-language", l);
    } catch {}
  }, []);

  const navigate = useCallback(
    (path: string) => {
      nextRouter.push(path);
    },
    [nextRouter]
  );

  const t = useCallback((key: string) => translate(language, key), [language]);

  return (
    <SiteContext.Provider
      value={{
        siteType,
        language,
        signupPackage,
        setSiteType,
        setLanguage,
        setSignupPackage,
        navigate,
        t,
      }}
    >
      {children}
    </SiteContext.Provider>
  );
}

export function useRouter() {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error("useRouter must be used within SiteProvider");
  return ctx;
}
