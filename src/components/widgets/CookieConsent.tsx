"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cookie,
  Check,
  X,
  ShieldCheck,
  Settings2,
  Lock,
  Sparkles,
  Activity,
  Globe2,
  Info,
  Radio,
  CheckCircle2,
  Loader2,
  ChevronRight,
  HelpCircle,
  Eye,
  Sliders,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const CHOICE_KEY = "lh-cookie-consent";

export interface CookiePreferences {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
}

export interface ClientConnectionInfo {
  ip: string;
  city: string;
  country: string;
  isp: string;
  browser: string;
  os: string;
  device: string;
}

export function getStoredConsent(): CookiePreferences | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CHOICE_KEY);
    if (raw) return JSON.parse(raw);
    const m = document.cookie.match(/(?:^|;\s*)lh_cookie_consent=([^;]+)/);
    if (m) return JSON.parse(decodeURIComponent(m[1]));
  } catch {
    return null;
  }
  return null;
}

export const getConsent = getStoredConsent;

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"urgent" | "useful" | "perf" | "marketing">("urgent");
  const [saving, setSaving] = useState(false);
  const [clientInfo, setClientInfo] = useState<ClientConnectionInfo | null>(null);
  const [savedFeedback, setSavedFeedback] = useState<string | null>(null);

  // Default state for categories
  const [prefs, setPrefs] = useState<CookiePreferences>({
    necessary: true, // Urgents (always true)
    functional: true, // Utiles
    analytics: true, // Performance
    marketing: false, // Marketing
  });

  useEffect(() => {
    // Check existing consent
    const existing = getStoredConsent();
    if (!existing) {
      const timer = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(timer);
    } else {
      setPrefs(existing);
    }
  }, []);

  // Fetch real IP & connection details on mount or open
  useEffect(() => {
    fetch("/api/cookies/consent", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (d.ok && d.details) {
          setClientInfo({
            ip: d.ip,
            ...d.details,
          });
        }
      })
      .catch(() => {});
  }, [modalOpen]);

  const saveConsent = async (chosenPrefs: CookiePreferences) => {
    setSaving(true);
    setSavedFeedback(null);
    try {
      const res = await fetch("/api/cookies/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...chosenPrefs,
          source: modalOpen ? "modal" : "banner",
        }),
      });
      const data = await res.json();
      if (data.ok) {
        window.localStorage.setItem(CHOICE_KEY, JSON.stringify(chosenPrefs));
        setPrefs(chosenPrefs);
        setClientInfo(data.details);
        setSavedFeedback(
          `✓ Consentement enregistré pour votre adresse IP : ${data.details?.ip || "Client"} (${data.details?.city || "Kinshasa"})`
        );
        setTimeout(() => {
          setVisible(false);
          setModalOpen(false);
        }, 800);
      }
    } catch {
      window.localStorage.setItem(CHOICE_KEY, JSON.stringify(chosenPrefs));
      setVisible(false);
      setModalOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const acceptAll = () => {
    const all = { necessary: true, functional: true, analytics: true, marketing: true };
    saveConsent(all);
  };

  const acceptUrgentsOnly = () => {
    const min = { necessary: true, functional: false, analytics: false, marketing: false };
    saveConsent(min);
  };

  const handleCustomSave = () => {
    saveConsent(prefs);
  };

  return (
    <>
      {/* Floating Bottom Cookie Banner */}
      <AnimatePresence>
        {visible && !modalOpen && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-4 left-4 right-4 z-[90] max-w-4xl mx-auto select-none"
            role="dialog"
            aria-label="Gestion des cookies Liquid Home"
          >
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/80 p-5 md:p-6 text-brand-navy">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
                {/* Text & Icon */}
                <div className="flex items-start gap-3.5">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-brand-orange via-brand-orange-hover to-brand-navy flex items-center justify-center flex-shrink-0 shadow-md shadow-brand-orange/20 text-white">
                    <Cookie className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-bold text-base text-brand-navy">
                        Gestion des Cookies &amp; Confidentialité 🍪
                      </p>
                      {clientInfo && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200 flex items-center gap-1">
                          <Radio className="h-2.5 w-2.5 text-emerald-600 animate-pulse" />
                          IP Détectée : {clientInfo.ip}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-brand-muted leading-relaxed max-w-2xl">
                      Nous utilisons des cookies <strong>Urgents &amp; Essentiels</strong> pour sécuriser votre session et vos paiements, et des cookies <strong>Utiles &amp; de Performance</strong> pour mémoriser votre éligibilité fibre et mesurer la vitesse du réseau.{" "}
                      <Link href="/cookies" className="text-brand-orange font-semibold hover:underline">
                        Politique des cookies
                      </Link>
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                  <button
                    type="button"
                    onClick={() => setModalOpen(true)}
                    className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-brand-navy text-xs font-semibold transition-colors"
                  >
                    <Sliders className="h-3.5 w-3.5 text-brand-orange" />
                    Personnaliser
                  </button>

                  <button
                    type="button"
                    onClick={acceptUrgentsOnly}
                    disabled={saving}
                    className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border-2 border-brand-navy/20 text-brand-navy text-xs font-bold hover:bg-brand-navy/5 transition-colors"
                  >
                    Urgents Uniquement
                  </button>

                  <button
                    type="button"
                    onClick={acceptAll}
                    disabled={saving}
                    className="flex-1 md:flex-none btn-brand text-xs py-2.5 px-4 font-bold shadow-md shadow-brand-orange/30 whitespace-nowrap"
                  >
                    {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                    Tout Accepter
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detailed Cookie Customizer Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden bg-white max-h-[90vh] flex flex-col">
          <DialogTitle className="sr-only">Paramétrage des cookies</DialogTitle>
          <DialogDescription className="sr-only">Sélectionnez vos préférences de cookies par onglet.</DialogDescription>

          {/* Modal Header */}
          <div className="bg-brand-header-gradient px-6 py-5 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/15 backdrop-blur border border-white/25 flex items-center justify-center">
                <Cookie className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Centre de Préférences des Cookies</h2>
                <p className="text-xs text-white/75">Transparence &amp; contrôle total sur vos données</p>
              </div>
            </div>
          </div>

          {/* Client Connection Audit Card */}
          {clientInfo && (
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 text-xs flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-slate-600">
                  Votre IP : <strong className="text-slate-900 font-mono">{clientInfo.ip}</strong> · {clientInfo.city}, {clientInfo.country}
                </span>
              </div>
              <span className="text-slate-500 text-[11px]">
                Fournisseur : <strong className="text-slate-700">{clientInfo.isp}</strong>
              </span>
            </div>
          )}

          {/* Body with Tabbed Navigation */}
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            {/* Tabs List */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("urgent")}
                className={`px-3 py-2.5 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 border transition-all ${
                  activeTab === "urgent"
                    ? "bg-red-50 text-red-900 border-red-300 shadow-sm"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-1">
                  <Lock className="h-3.5 w-3.5 text-red-600" />
                  <span>🔴 Urgents</span>
                </div>
                <span className="text-[10px] font-normal text-red-700 font-medium">Requis / Sécurité</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("useful")}
                className={`px-3 py-2.5 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 border transition-all ${
                  activeTab === "useful"
                    ? "bg-emerald-50 text-emerald-900 border-emerald-300 shadow-sm"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                  <span>🟢 Utiles</span>
                </div>
                <span className="text-[10px] font-normal text-emerald-700 font-medium">Navigation &amp; GPS</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("perf")}
                className={`px-3 py-2.5 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 border transition-all ${
                  activeTab === "perf"
                    ? "bg-blue-50 text-blue-900 border-blue-300 shadow-sm"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-1">
                  <Activity className="h-3.5 w-3.5 text-blue-600" />
                  <span>🔵 Performance</span>
                </div>
                <span className="text-[10px] font-normal text-blue-700 font-medium">Speed Test &amp; Débit</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("marketing")}
                className={`px-3 py-2.5 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 border transition-all ${
                  activeTab === "marketing"
                    ? "bg-purple-50 text-purple-900 border-purple-300 shadow-sm"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-1">
                  <Globe2 className="h-3.5 w-3.5 text-purple-600" />
                  <span>🟣 Marketing</span>
                </div>
                <span className="text-[10px] font-normal text-purple-700 font-medium">Offres de Quartier</span>
              </button>
            </div>

            {/* Tab Details */}
            <div className="bg-gray-50/70 border border-gray-200/80 rounded-2xl p-5 space-y-4">
              {/* URGENT TAB */}
              {activeTab === "urgent" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-brand-navy flex items-center gap-1.5">
                        <Lock className="h-4 w-4 text-red-600" />
                        Cookies Urgents &amp; Strictement Nécessaires
                      </h4>
                      <p className="text-xs text-brand-muted mt-0.5">
                        Indispensables au fonctionnement technique, à la sécurité et à l&apos;accès client.
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-800 text-[11px] font-bold">
                      Toujours Actif
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed">
                    Ces cookies garantissent la sécurité de votre session, la protection anti-CSRF lors des paiements MaishaPay, l&apos;authentification à l&apos;espace <strong>MyLiquid</strong>, et le bon fonctionnement du portail client. Sans ces cookies, les services web ne peuvent pas fonctionner.
                  </p>

                  <div className="bg-white rounded-xl border border-gray-200 p-3 space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-gray-100">
                      <span className="font-mono text-slate-800 font-semibold">lh_session</span>
                      <span className="text-slate-500">Maintien de la session client sécurisée</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-100">
                      <span className="font-mono text-slate-800 font-semibold">lh_site_access</span>
                      <span className="text-slate-500">Code d&apos;accès environnement</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="font-mono text-slate-800 font-semibold">lh_cookie_consent</span>
                      <span className="text-slate-500">Mémorisation de vos choix de confidentialité</span>
                    </div>
                  </div>
                </div>
              )}

              {/* USEFUL TAB */}
              {activeTab === "useful" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-brand-navy flex items-center gap-1.5">
                        <Sparkles className="h-4 w-4 text-emerald-600" />
                        Cookies Utiles &amp; Fonctionnels
                      </h4>
                      <p className="text-xs text-brand-muted mt-0.5">
                        Amélioration de votre navigation, mémorisation de votre langue et GPS.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={prefs.functional}
                        onChange={(e) => setPrefs({ ...prefs, functional: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed">
                    Ces cookies permettent de mémoriser vos préférences de langue (Français / Anglais), votre adresse saisie ou votre position GPS sur la carte Google pour vérifier immédiatement l&apos;éligibilité fibre de votre domicile sans ressaisie.
                  </p>

                  <div className="bg-white rounded-xl border border-gray-200 p-3 space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-gray-100">
                      <span className="font-mono text-slate-800 font-semibold">lh_lang</span>
                      <span className="text-slate-500">Langue préférée (FR / EN)</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="font-mono text-slate-800 font-semibold">lh_geo_cache</span>
                      <span className="text-slate-500">Coordonnées GPS pour le test de couverture</span>
                    </div>
                  </div>
                </div>
              )}

              {/* PERF TAB */}
              {activeTab === "perf" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-brand-navy flex items-center gap-1.5">
                        <Activity className="h-4 w-4 text-blue-600" />
                        Cookies de Performance &amp; Mesure Réseau
                      </h4>
                      <p className="text-xs text-brand-muted mt-0.5">
                        Optimisation des débits de la fibre et historique du Speed Test.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={prefs.analytics}
                        onChange={(e) => setPrefs({ ...prefs, analytics: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed">
                    Ces cookies mesurent de manière anonyme la vitesse de chargement des pages et enregistrent vos scores Speed Test pour vous aider à diagnostiquer la qualité de votre ligne fibre optique.
                  </p>

                  <div className="bg-white rounded-xl border border-gray-200 p-3 space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-gray-100">
                      <span className="font-mono text-slate-800 font-semibold">lh_speedtest_hist</span>
                      <span className="text-slate-500">Historique local de vos tests de débit</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="font-mono text-slate-800 font-semibold">lh_pop_pref</span>
                      <span className="text-slate-500">POP régional le plus rapide (Kinshasa, Katanga...)</span>
                    </div>
                  </div>
                </div>
              )}

              {/* MARKETING TAB */}
              {activeTab === "marketing" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-brand-navy flex items-center gap-1.5">
                        <Globe2 className="h-4 w-4 text-purple-600" />
                        Cookies Marketing &amp; Offres de Quartier
                      </h4>
                      <p className="text-xs text-brand-muted mt-0.5">
                        Promotions et nouveautés adaptées à votre commune.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={prefs.marketing}
                        onChange={(e) => setPrefs({ ...prefs, marketing: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed">
                    Ces cookies nous aident à vous présenter les offres promotionnelles Libota (Fibre Home &amp; PME) spécifiques à votre commune (ex: promotions d&apos;installation gratuite à Gombe, Limete ou Ngaliema).
                  </p>
                </div>
              )}
            </div>

            {/* Saved feedback */}
            {savedFeedback && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                <span>{savedFeedback}</span>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={acceptUrgentsOnly}
              className="text-xs text-slate-600 hover:text-slate-900 font-semibold hover:underline"
            >
              Refuser tout sauf les cookies urgents
            </button>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleCustomSave}
                disabled={saving}
                className="btn-navy text-xs py-2.5 px-4 font-bold flex-1 sm:flex-none"
              >
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Enregistrer mes choix"}
              </button>
              <button
                type="button"
                onClick={acceptAll}
                disabled={saving}
                className="btn-brand text-xs py-2.5 px-4 font-bold flex-1 sm:flex-none"
              >
                Tout Accepter
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function track(kind: string, payload: Record<string, unknown> = {}) {
  try {
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, ...payload }),
      keepalive: true,
    }).catch(() => {});
  } catch {}
}
