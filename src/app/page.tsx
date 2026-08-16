"use client";

import { RouterProvider, useRouter } from "@/lib/router";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { AvailabilityChecker } from "@/components/layout/AvailabilityChecker";
import { WhatsAppFloat } from "@/components/widgets/WhatsAppFloat";
import { SiteTypeModal } from "@/components/widgets/SiteTypeModal";
import { HomePage } from "@/components/pages/HomePage";
import { BusinessPage } from "@/components/pages/BusinessPage";
import { ProductsServicesPage } from "@/components/pages/ProductsServicesPage";
import { PackagesPage } from "@/components/pages/PackagesPage";
import { ContactPage } from "@/components/pages/ContactPage";
import { SignupPage } from "@/components/pages/SignupPage";
import { MyLiquidPage } from "@/components/pages/MyLiquidPage";
import { LegalPage } from "@/components/pages/LegalPage";

function CurrentPage() {
  const { route } = useRouter();

  switch (route) {
    case "home":
      return <HomePage />;
    case "business":
      return <BusinessPage />;
    case "products-and-services":
      return <ProductsServicesPage />;
    case "packages":
      return <PackagesPage />;
    case "contact-us":
      return <ContactPage />;
    case "signup":
      return <SignupPage />;
    case "myliquid":
      return <MyLiquidPage />;
    case "privacy-policy":
    case "cookies-policy":
    case "usage":
    case "terms-and-conditions":
      return <LegalPage route={route} />;
    default:
      return <HomePage />;
  }
}

function Shell() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SiteHeader />
      <AvailabilityChecker />
      <main className="flex-1">
        <CurrentPage />
      </main>
      <SiteFooter />
      <WhatsAppFloat />
      <SiteTypeModal />
    </div>
  );
}

export default function Home() {
  return (
    <RouterProvider>
      <Shell />
    </RouterProvider>
  );
}
