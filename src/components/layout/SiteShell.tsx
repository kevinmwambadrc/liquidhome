"use client";

import { ReactNode, useEffect } from "react";
import { usePathname } from "next/navigation";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { AvailabilityChecker } from "@/components/layout/AvailabilityChecker";
import { SiteTypeModal } from "@/components/widgets/SiteTypeModal";
import { CookieConsent, getConsent, track } from "@/components/widgets/CookieConsent";

export function SiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  // The availability checker is irrelevant inside the portals
  const isPortal = pathname.startsWith("/myliquid") || pathname.startsWith("/admin");

  // Audience measurement (only active after cookie consent)
  useEffect(() => {
    if (getConsent() === "accepted") {
      track("pageview", { path: pathname });
    }
  }, [pathname]);

  // Global click tracking (buttons/links label)
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (getConsent() !== "accepted") return;
      const el = (e.target as HTMLElement | null)?.closest("button, a");
      if (!el) return;
      const label =
        (el.getAttribute("aria-label") ||
          el.textContent ||
          "")
          .trim()
          .slice(0, 80);
      if (!label) return;
      track("click", { path: pathname, label });
    };
    document.addEventListener("click", onClick, { passive: true });
    return () => document.removeEventListener("click", onClick);
  }, [pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SiteHeader />
      {!isPortal && <AvailabilityChecker />}
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <SiteTypeModal />
      <CookieConsent />
    </div>
  );
}
