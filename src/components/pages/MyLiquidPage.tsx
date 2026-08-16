"use client";

import { useState } from "react";
import { useRouter } from "@/lib/router";
import { PageBanner } from "@/components/sections/PageBanner";
import Image from "next/image";
import { User, Lock, Eye, EyeOff, Loader2, LogIn, ArrowRight, Gauge, FileText, Headphones, CreditCard } from "lucide-react";

export function MyLiquidPage() {
  const { navigate } = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    // Stub: just show error since portal is not real backend
    alert("Portail MyLiquid — démo. Le portail client complet sera disponible prochainement.");
  };

  return (
    <>
      <PageBanner
        title="Espace Client MyLiquid"
        subtitle="Connectez-vous pour gérer votre abonnement, consulter vos factures, suivre votre consommation et contacter notre support."
      />

      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Login form */}
          <div className="max-w-md w-full mx-auto">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8">
              <div className="flex justify-center mb-6">
                <Image
                  src="/img/myliquid.png"
                  alt="MyLiquid"
                  width={180}
                  height={48}
                  className="h-12 w-auto"
                />
              </div>
              <h2 className="text-xl font-bold text-brand-navy text-center mb-1">
                Connexion
              </h2>
              <p className="text-sm text-brand-muted text-center mb-6">
                Accédez à votre espace personnel
              </p>

              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-brand-navy mb-2">
                    Email ou numéro client
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-muted" />
                    <input
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="client@liquid.tech"
                      className="input-brand pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-brand-navy mb-2">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-muted" />
                    <input
                      type={showPwd ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="input-brand pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-navy"
                      aria-label={showPwd ? "Masquer" : "Afficher"}
                    >
                      {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 text-brand-muted cursor-pointer">
                    <input type="checkbox" className="rounded border-gray-300" />
                    Se souvenir de moi
                  </label>
                  <button type="button" className="text-brand-orange hover:underline">
                    Mot de passe oublié ?
                  </button>
                </div>

                <button type="submit" disabled={loading} className="btn-brand btn-brand-block btn-brand-lg">
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Connexion...
                    </>
                  ) : (
                    <>
                      <LogIn className="h-4 w-4" />
                      Se connecter
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-100 text-center text-sm">
                <p className="text-brand-muted mb-2">Pas encore client ?</p>
                <button
                  onClick={() => navigate("signup")}
                  className="inline-flex items-center gap-1 text-brand-orange font-semibold hover:underline"
                >
                  Souscrire à un forfait <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Features preview */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-brand-navy mb-4">
              Tout votre abonnement au bout des doigts
            </h3>
            {[
              { icon: Gauge, title: "Suivi de consommation", desc: "Visualisez votre consommation de données en temps réel, par jour, semaine ou mois." },
              { icon: FileText, title: "Factures & paiements", desc: "Consultez et téléchargez vos factures, payez en ligne par Mobile Money ou carte." },
              { icon: Headphones, title: "Support technique", desc: "Ouvrez des tickets et suivez leur résolution, chattez avec nos techniciens." },
              { icon: CreditCard, title: "Gestion du forfait", desc: "Changez de forfait, ajoutez des options, mettez à jour vos coordonnées." },
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="flex gap-4 p-4 rounded-xl bg-brand-soft hover:bg-orange-50 transition-colors"
                >
                  <div className="h-12 w-12 rounded-lg bg-brand-orange flex items-center justify-center flex-shrink-0">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-brand-navy">{f.title}</h4>
                    <p className="text-sm text-brand-muted">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
