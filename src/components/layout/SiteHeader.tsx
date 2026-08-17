"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, User, Globe, ChevronDown, LogOut } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "@/lib/router";
import { navItemsFor, SITE_TYPE_OPTIONS } from "@/lib/content";

interface MeUser {
  name: string | null;
  email: string;
  role: string;
}

export function SiteHeader() {
  const { siteType, setSiteType, navigate, language, setLanguage, t } = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [me, setMe] = useState<MeUser | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu whenever the route changes (incl. back/forward)
  useEffect(() => {
    const raf = requestAnimationFrame(() => setMobileOpen(false));
    return () => cancelAnimationFrame(raf);
  }, [pathname]);

  // Track the session so the header reflects the signed-in user instantly:
  // refetch on route change AND on any login/logout/signup in the app.
  useEffect(() => {
    let cancelled = false;
    const load = () => {
      fetch("/api/auth/me", { cache: "no-store" })
        .then((r) => r.json())
        .then((d) => {
          if (!cancelled) setMe(d.user ?? null);
        })
        .catch(() => {});
    };
    load();
    window.addEventListener("lh:auth", load);
    return () => {
      cancelled = true;
      window.removeEventListener("lh:auth", load);
    };
  }, [pathname]);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setMe(null);
    window.dispatchEvent(new CustomEvent("lh:auth"));
    navigate("/");
  };

  const navItems = navItemsFor(siteType);

  const label = (item: (typeof navItems)[number]) =>
    language === "en" ? item.labelEn ?? item.label : item.label;

  const handleNav = (r: (typeof navItems)[number]["route"]) => {
    navigate(r);
    // In-page anchor (e.g. "/business#services"): scroll explicitly to the
    // section, including when we are already on that page.
    const hashIndex = r.indexOf("#");
    if (hashIndex !== -1) {
      const hash = r.slice(hashIndex + 1);
      setTimeout(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
      }, 400);
    }
    setMobileOpen(false);
  };

  const handleSiteType = (ty: "home" | "business") => {
    setSiteType(ty);
    navigate(ty === "home" ? "/" : "/business");
    setMobileOpen(false);
  };

  const switchLang = (l: "fr" | "en") => {
    setLanguage(l);
    setLangOpen(false);
  };

  const initials = me?.name
    ? me.name
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : null;

  return (
    <header
      className={`bg-brand-header-gradient text-white sticky top-0 z-40 transition-shadow duration-300 ${
        scrolled ? "shadow-xl backdrop-blur-md" : "shadow-lg"
      }`}
    >
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
                  {language === "en" ? opt.labelEn : opt.label}
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
                aria-label={t("header.language")}
              >
                <Globe className="h-3.5 w-3.5" />
                <span>{language === "fr" ? "Français" : "English"}</span>
                <ChevronDown className="h-3 w-3" />
              </button>
              {langOpen && (
                <div className="absolute right-0 mt-1 w-32 bg-white text-gray-800 rounded-md shadow-lg py-1 z-50">
                  <button
                    onClick={() => switchLang("fr")}
                    className={`w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center gap-2 ${
                      language === "fr" ? "font-semibold text-brand-orange" : ""
                    }`}
                  >
                    <span className="text-base">🇫🇷</span> Français
                  </button>
                  <button
                    onClick={() => switchLang("en")}
                    className={`w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center gap-2 ${
                      language === "en" ? "font-semibold text-brand-orange" : ""
                    }`}
                  >
                    <span className="text-base">🇬🇧</span> English
                  </button>
                </div>
              )}
            </div>

            {/* MyLiquid portal */}
            <button
              onClick={() => navigate("/myliquid")}
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

            {/* Session-aware login / user chip */}
            {me ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate(me.role === "admin" ? "/admin" : "/myliquid")}
                  className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 transition-colors"
                  title={me.email}
                >
                  <span className="h-5 w-5 rounded-full bg-brand-orange flex items-center justify-center text-[10px] font-bold text-white">
                    {initials}
                  </span>
                  <span className="font-semibold max-w-32 truncate">{me.name ?? me.email}</span>
                </button>
                <button
                  onClick={logout}
                  className="flex items-center gap-1 text-white/80 hover:text-white"
                  title={t("header.logout")}
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate("/myliquid")}
                className="flex items-center gap-1.5 text-white/90 hover:text-white"
              >
                <User className="h-3.5 w-3.5" />
                <span>{t("header.login")}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main nav row - logo left, nav centered, login right */}
      <div className="max-w-7xl mx-auto px-4 relative flex items-center justify-between h-16 md:h-20">
        {/* Logo - left */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center z-10"
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

        {/* Desktop nav - absolutely centered */}
        <nav className="hidden lg:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.route.split("#")[0] && (item.route.includes("#") ? pathname + window.location.hash === item.route : true);
            const isActive = typeof window !== "undefined" ? active : pathname === item.route.split("#")[0];
            return (
              <button
                key={item.route}
                onClick={() => handleNav(item.route)}
                className={`relative px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
                  isActive ? "text-white" : "text-white/85 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label(item)}
                {active && (
                  <span className="absolute -bottom-px left-4 right-4 h-0.5 bg-[#F89E3C] rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right side: Souscrire CTA (desktop) */}
        <div className="hidden md:flex items-center z-10">
          <button onClick={() => navigate("/souscrire")} className="btn-brand text-xs px-4 py-2">
            {t("header.subscribe")}
          </button>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="md:hidden p-2 text-white z-10"
          aria-label="Menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden bg-brand-navy border-t border-white/10 overflow-hidden"
          >
            <nav className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.route;
                return (
                  <button
                    key={item.route}
                    onClick={() => handleNav(item.route)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-md text-left whitespace-nowrap ${
                      active
                        ? "bg-white/10 text-white border-l-4 border-[#F89E3C]"
                        : "text-white/85 hover:bg-white/5"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label(item)}
                  </button>
                );
              })}

              <div className="my-2 h-px bg-white/10" />

              <div className="px-3 py-2 text-xs uppercase tracking-wide text-white/60">
                {language === "en" ? "Site type" : "Type de site"}
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
                    {language === "en" ? opt.labelEn : opt.label}
                  </button>
                );
              })}

              <div className="my-2 h-px bg-white/10" />

              {/* Language switcher - mobile */}
              <div className="flex items-center gap-2 px-3 py-2">
                <Globe className="h-4 w-4 text-white/60" />
                {(["fr", "en"] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => switchLang(l)}
                    className={`px-3 py-1.5 rounded-md text-sm ${
                      language === l
                        ? "bg-brand-orange text-white font-semibold"
                        : "text-white/80 hover:bg-white/10"
                    }`}
                  >
                    {l === "fr" ? "🇫🇷 FR" : "🇬🇧 EN"}
                  </button>
                ))}
              </div>

              {me ? (
                <button
                  onClick={() => {
                    navigate(me.role === "admin" ? "/admin" : "/myliquid");
                    setMobileOpen(false);
                  }}
                  className="flex items-center gap-3 px-3 py-3 rounded-md text-left text-white hover:bg-white/5"
                >
                  <span className="h-6 w-6 rounded-full bg-brand-orange flex items-center justify-center text-[11px] font-bold text-white">
                    {initials}
                  </span>
                  <span className="font-semibold truncate">{me.name ?? me.email}</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    navigate("/myliquid");
                    setMobileOpen(false);
                  }}
                  className="flex items-center gap-3 px-3 py-3 rounded-md text-left text-white/85 hover:bg-white/5"
                >
                  <User className="h-4 w-4" />
                  {t("header.login")}
                </button>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
