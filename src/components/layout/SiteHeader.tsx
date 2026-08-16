"use client";

import { useState } from "react";
import Image from "next/image";
import { Menu, X, User, Globe, ChevronDown } from "lucide-react";
import { useRouter } from "@/lib/router";
import { NAV_ITEMS, SITE_TYPE_OPTIONS } from "@/lib/content";

export function SiteHeader() {
  const { route, siteType, setSiteType, navigate } = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const handleNav = (r: typeof NAV_ITEMS[number]["route"]) => {
    navigate(r);
    setMobileOpen(false);
  };

  const handleSiteType = (t: "home" | "business") => {
    setSiteType(t);
    navigate(t);
    setMobileOpen(false);
  };

  return (
    <header className="bg-brand-header-gradient text-white shadow-lg sticky top-0 z-40">
      {/* Top utility row - desktop */}
      <div className="hidden md:block border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-9 text-xs">
          <div className="flex items-center gap-4">
            {/* Site-type switcher */}
            <div className="flex items-center gap-2">
              {SITE_TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleSiteType(opt.id)}
                  className={`px-3 py-1 rounded-sm transition-colors ${
                    siteType === opt.id
                      ? "bg-white/20 text-white font-semibold"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Language switcher */}
            <div className="relative">
              <button
                onClick={() => setLangOpen((v) => !v)}
                onBlur={() => setTimeout(() => setLangOpen(false), 150)}
                className="flex items-center gap-1 text-white/90 hover:text-white"
              >
                <Globe className="h-3.5 w-3.5" />
                <span>Français</span>
                <ChevronDown className="h-3 w-3" />
              </button>
              {langOpen && (
                <div className="absolute right-0 mt-1 w-32 bg-white text-gray-800 rounded-md shadow-lg py-1 z-50">
                  <button className="w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center gap-2">
                    <span className="text-base">🇫🇷</span> Français
                  </button>
                  <button className="w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center gap-2">
                    <span className="text-base">🇬🇧</span> English
                  </button>
                </div>
              )}
            </div>

            {/* MyLiquid portal + login */}
            <button
              onClick={() => navigate("myliquid")}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <Image
                src="/img/myliquid.png"
                alt="MyLiquid"
                width={60}
                height={16}
                className="h-4 w-auto"
              />
            </button>
            <button
              onClick={() => navigate("myliquid")}
              className="flex items-center gap-1.5 text-white/90 hover:text-white"
            >
              <User className="h-3.5 w-3.5" />
              <span>Se connecter</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main nav row */}
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16 md:h-20">
        {/* Logo */}
        <button
          onClick={() => handleNav("home")}
          className="flex items-center"
          aria-label="Liquid Home - Accueil"
        >
          <Image
            src="/img/liquid_home2.png"
            alt="Liquid Home"
            width={162}
            height={50}
            priority
            className="h-8 md:h-12 w-auto"
          />
        </button>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = route === item.route;
            return (
              <button
                key={item.route}
                onClick={() => handleNav(item.route)}
                className={`relative px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
                  active ? "text-white" : "text-white/85 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
                {active && (
                  <span className="absolute -bottom-px left-4 right-4 h-0.5 bg-[#F89E3C] rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="md:hidden p-2 text-white"
          aria-label="Menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-brand-navy border-t border-white/10">
          <nav className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = route === item.route;
              return (
                <button
                  key={item.route}
                  onClick={() => handleNav(item.route)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-md text-left ${
                    active
                      ? "bg-white/10 text-white border-l-4 border-[#F89E3C]"
                      : "text-white/85 hover:bg-white/5"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}

            <div className="my-2 h-px bg-white/10" />

            <div className="px-3 py-2 text-xs uppercase tracking-wide text-white/60">
              Type de site
            </div>
            {SITE_TYPE_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.id}
                  onClick={() => handleSiteType(opt.id)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-md text-left ${
                    siteType === opt.id
                      ? "bg-white/10 text-white"
                      : "text-white/85 hover:bg-white/5"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {opt.label}
                </button>
              );
            })}

            <div className="my-2 h-px bg-white/10" />

            <button
              onClick={() => {
                navigate("myliquid");
                setMobileOpen(false);
              }}
              className="flex items-center gap-3 px-3 py-3 rounded-md text-left text-white/85 hover:bg-white/5"
            >
              <User className="h-4 w-4" />
              Se connecter
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
