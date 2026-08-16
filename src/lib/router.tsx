"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";

export type Route =
  | "home"
  | "business"
  | "products-and-services"
  | "packages"
  | "contact-us"
  | "signup"
  | "myliquid"
  | "privacy-policy"
  | "cookies-policy"
  | "usage"
  | "terms-and-conditions";

export type SiteType = "home" | "business";
export type Language = "fr" | "en";

interface RouterState {
  route: Route;
  siteType: SiteType;
  language: Language;
  navigate: (route: Route) => void;
  setSiteType: (t: SiteType) => void;
  setLanguage: (l: Language) => void;
  signupPackage?: string;
  setSignupPackage: (p?: string) => void;
}

const RouterContext = createContext<RouterState | null>(null);

const VALID_ROUTES: Route[] = [
  "home",
  "business",
  "products-and-services",
  "packages",
  "contact-us",
  "signup",
  "myliquid",
  "privacy-policy",
  "cookies-policy",
  "usage",
  "terms-and-conditions",
];

function getInitialRoute(): Route {
  if (typeof window === "undefined") return "home";
  const hash = window.location.hash.replace("#", "") as Route;
  return VALID_ROUTES.includes(hash) ? hash : "home";
}

export function RouterProvider({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState<Route>(getInitialRoute);
  const [siteType, setSiteType] = useState<SiteType>("home");
  const [language, setLanguage] = useState<Language>("fr");
  const [signupPackage, setSignupPackage] = useState<string | undefined>(undefined);

  const navigate = useCallback((r: Route) => {
    setRoute(r);
    // Scroll to top on navigation
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    // Update hash without triggering reload
    if (typeof window !== "undefined") {
      const newHash = r === "home" ? "" : `#${r}`;
      if (window.location.hash !== newHash) {
        window.history.replaceState(null, "", newHash || window.location.pathname);
      }
    }
  }, []);

  // Listen to hashchange (back/forward)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onHash = () => {
      const hash = window.location.hash.replace("#", "") as Route;
      if (VALID_ROUTES.includes(hash)) {
        setRoute(hash);
      } else if (hash === "") {
        setRoute("home");
      }
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  return (
    <RouterContext.Provider
      value={{ route, siteType, language, navigate, setSiteType, setLanguage, signupPackage, setSignupPackage }}
    >
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error("useRouter must be used within RouterProvider");
  return ctx;
}
