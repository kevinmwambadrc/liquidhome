"use client";

import { useState } from "react";
import { PageBanner } from "@/components/sections/PageBanner";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageSquare,
  Send,
  Loader2,
  CheckCircle2,
  Building2,
  Home,
  User,
  Globe,
} from "lucide-react";
import { CONTACT_INFO, HOW_IT_WORKS_STEPS } from "@/lib/content";
import { useRouter } from "@/lib/router";

export function ContactPage() {
  const { navigate } = useRouter();
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    telephone: "",
    city: "",
    area_of_interest: "home" as "home" | "business",
    service: "",
    company_name: "",
    company_size: "",
    industry: "",
    requirements: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<null | { ok: boolean; message: string }>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/contact/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      setResult({
        ok: !!data.ok,
        message: data.message || "Message envoyé ! Nous vous contacterons bientôt.",
      });
      if (data.ok) {
        setForm({
          first_name: "",
          last_name: "",
          email: "",
          telephone: "",
          city: "",
          area_of_interest: "home",
          service: "",
          company_name: "",
          company_size: "",
          industry: "",
          requirements: "",
        });
      }
    } catch {
      setResult({ ok: false, message: "Erreur réseau. Réessayez plus tard." });
    } finally {
      setLoading(false);
    }
  };

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <>
      <PageBanner
        title="Contact"
        subtitle="A la maison ou au travail, notre objectif est que vous soyez toujours connectés ! C'est pourquoi vous pouvez compter sur le service client de Liquid Home pour vous fournir une assistance dédiée."
      />

      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <aside className="space-y-6">
            {/* How it works */}
            <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm">
              <div className="bg-brand-navy text-white px-4 py-3">
                <h3 className="font-bold text-sm uppercase tracking-wide">
                  Comment ça marche ?
                </h3>
              </div>
              <ol className="bg-white p-4 space-y-3">
                {HOW_IT_WORKS_STEPS.map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="flex-shrink-0 h-7 w-7 rounded-full bg-brand-orange text-white font-bold text-sm flex items-center justify-center">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-brand-navy text-sm">
                        {step.title}
                      </p>
                      <p className="text-xs text-brand-muted">{step.description}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* Need help */}
            <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm">
              <div className="bg-brand-navy text-white px-4 py-3">
                <h3 className="font-bold text-sm uppercase tracking-wide">
                  Besoin d'aide
                </h3>
              </div>
              <div className="bg-white p-4 space-y-3">
                <a
                  href={`tel:${CONTACT_INFO.shortPhone}`}
                  className="flex items-center gap-3 p-2 rounded-md hover:bg-orange-50 transition-colors"
                >
                  <div className="h-9 w-9 rounded-full bg-brand-orange/10 flex items-center justify-center">
                    <Phone className="h-4 w-4 text-brand-orange" />
                  </div>
                  <div>
                    <p className="text-xs text-brand-muted">Téléphone (gratuit)</p>
                    <p className="font-bold text-brand-navy">{CONTACT_INFO.shortPhone}</p>
                  </div>
                </a>
                <a
                  href={`tel:${CONTACT_INFO.fullPhone.replace(/\s/g, "")}`}
                  className="flex items-center gap-3 p-2 rounded-md hover:bg-orange-50 transition-colors"
                >
                  <div className="h-9 w-9 rounded-full bg-brand-orange/10 flex items-center justify-center">
                    <Phone className="h-4 w-4 text-brand-orange" />
                  </div>
                  <div>
                    <p className="text-xs text-brand-muted">Mobile</p>
                    <p className="font-bold text-brand-navy">{CONTACT_INFO.fullPhone}</p>
                  </div>
                </a>
                <a
                  href={`mailto:${CONTACT_INFO.email}`}
                  className="flex items-center gap-3 p-2 rounded-md hover:bg-orange-50 transition-colors"
                >
                  <div className="h-9 w-9 rounded-full bg-brand-orange/10 flex items-center justify-center">
                    <Mail className="h-4 w-4 text-brand-orange" />
                  </div>
                  <div>
                    <p className="text-xs text-brand-muted">Email</p>
                    <p className="font-bold text-brand-navy text-sm break-all">
                      {CONTACT_INFO.email}
                    </p>
                  </div>
                </a>
                <div className="flex items-center gap-3 p-2">
                  <div className="h-9 w-9 rounded-full bg-brand-orange/10 flex items-center justify-center">
                    <MapPin className="h-4 w-4 text-brand-orange" />
                  </div>
                  <div>
                    <p className="text-xs text-brand-muted">Adresse</p>
                    <p className="font-bold text-brand-navy text-sm">
                      {CONTACT_INFO.city}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2">
                  <div className="h-9 w-9 rounded-full bg-brand-orange/10 flex items-center justify-center">
                    <Clock className="h-4 w-4 text-brand-orange" />
                  </div>
                  <div>
                    <p className="text-xs text-brand-muted">Horaires</p>
                    <p className="font-bold text-brand-navy text-xs">
                      Lun-Ven : {CONTACT_INFO.hoursWeekday}
                    </p>
                    <p className="font-bold text-brand-navy text-xs">
                      Week-end : {CONTACT_INFO.hoursWeekend}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Contact form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-full bg-brand-navy flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-brand-navy">
                    Envoyez-nous un message
                  </h2>
                  <p className="text-sm text-brand-muted">
                    Nous vous répondrons sous 24 heures
                  </p>
                </div>
              </div>

              {result && (
                <div
                  className={`mb-5 flex items-center gap-2 rounded-md px-4 py-3 text-sm ${
                    result.ok
                      ? "bg-green-50 text-green-800 border border-green-200"
                      : "bg-red-50 text-red-800 border border-red-200"
                  }`}
                >
                  {result.ok ? (
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                  ) : (
                    <Loader2 className="h-4 w-4 flex-shrink-0" />
                  )}
                  {result.message}
                </div>
              )}

              <form onSubmit={onSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field
                    label="Prénom"
                    icon={User}
                    value={form.first_name}
                    onChange={(v) => set("first_name", v)}
                    required
                  />
                  <Field
                    label="Nom"
                    icon={User}
                    value={form.last_name}
                    onChange={(v) => set("last_name", v)}
                    required
                  />
                  <Field
                    label="Email"
                    icon={Mail}
                    type="email"
                    value={form.email}
                    onChange={(v) => set("email", v)}
                    required
                  />
                  <Field
                    label="Téléphone"
                    icon={Phone}
                    type="tel"
                    value={form.telephone}
                    onChange={(v) => set("telephone", v)}
                    required
                  />
                  <Field
                    label="Ville / Commune"
                    icon={MapPin}
                    value={form.city}
                    onChange={(v) => set("city", v)}
                    required
                  />
                </div>

                {/* Area of interest toggle */}
                <div>
                  <label className="block text-sm font-medium text-brand-navy mb-2">
                    Vous êtes ?
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => set("area_of_interest", "home")}
                      className={`flex items-center gap-2 px-4 py-3 rounded-md border-2 text-sm font-semibold transition-all ${
                        form.area_of_interest === "home"
                          ? "border-brand-orange bg-orange-50 text-brand-navy"
                          : "border-gray-200 text-brand-muted hover:border-brand-orange/50"
                      }`}
                    >
                      <Home className="h-4 w-4" />
                      Domicile
                    </button>
                    <button
                      type="button"
                      onClick={() => set("area_of_interest", "business")}
                      className={`flex items-center gap-2 px-4 py-3 rounded-md border-2 text-sm font-semibold transition-all ${
                        form.area_of_interest === "business"
                          ? "border-brand-orange bg-orange-50 text-brand-navy"
                          : "border-gray-200 text-brand-muted hover:border-brand-orange/50"
                      }`}
                    >
                      <Building2 className="h-4 w-4" />
                      Entreprise
                    </button>
                  </div>
                </div>

                {/* Conditional fields */}
                {form.area_of_interest === "home" ? (
                  <Field
                    label="Service souhaité"
                    icon={Globe}
                    value={form.service}
                    onChange={(v) => set("service", v)}
                    placeholder="Ex: Forfait Libota Super, vérification couverture..."
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Field
                      label="Nom de l'entreprise"
                      icon={Building2}
                      value={form.company_name}
                      onChange={(v) => set("company_name", v)}
                    />
                    <Field
                      label="Taille"
                      icon={User}
                      value={form.company_size}
                      onChange={(v) => set("company_size", v)}
                      placeholder="Ex: 5-10 employés"
                    />
                    <Field
                      label="Secteur"
                      icon={Globe}
                      value={form.industry}
                      onChange={(v) => set("industry", v)}
                      placeholder="Ex: Commerce"
                    />
                  </div>
                )}

                {/* Requirements */}
                <div>
                  <label className="block text-sm font-medium text-brand-navy mb-2">
                    Votre message <span className="text-brand-orange">*</span>
                  </label>
                  <textarea
                    value={form.requirements}
                    onChange={(e) => set("requirements", e.target.value)}
                    required
                    rows={5}
                    placeholder="Décrivez votre besoin, votre adresse, vos questions..."
                    className="input-brand resize-y"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-brand btn-brand-lg flex-1"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Envoyer le message
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("packages")}
                    className="px-6 py-3 rounded-md border-2 border-brand-navy text-brand-navy font-semibold hover:bg-brand-navy hover:text-white transition-colors"
                  >
                    Voir les forfaits
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function Field({
  label,
  icon: Icon,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  icon: typeof User;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-brand-navy mb-2">
        {label} {required && <span className="text-brand-orange">*</span>}
      </label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-muted" />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          placeholder={placeholder}
          className="input-brand pl-10"
        />
      </div>
    </div>
  );
}
