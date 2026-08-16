"use client";

import { useState } from "react";
import { PageBanner } from "@/components/sections/PageBanner";
import { useRouter } from "@/lib/router";
import { PACKAGES } from "@/lib/content";
import {
  MapPin,
  LocateFixed,
  Lock,
  Check,
  ChevronRight,
  ChevronLeft,
  Loader2,
  CheckCircle2,
  User,
  Mail,
  Phone,
  Home as HomeIcon,
  Wifi,
  PartyPopper,
  Calendar,
} from "lucide-react";

const STEPS = [
  { id: "location", label: "Location" },
  { id: "offers", label: "Offres" },
  { id: "details", label: "Détails" },
  { id: "confirmation", label: "Confirmation" },
];

export function SignupPage() {
  const { signupPackage, navigate } = useRouter();
  const [step, setStep] = useState(0);

  // Step 1 - location
  const [street, setStreet] = useState("");
  const [houseNo, setHouseNo] = useState("");
  const [pinPos, setPinPos] = useState({ x: 50, y: 50 });
  const [checking, setChecking] = useState(false);

  // Step 2 - offer
  const [selectedPkg, setSelectedPkg] = useState<string | undefined>(signupPackage);

  // Step 3 - details
  const [details, setDetails] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    installation_date: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Step 4 - confirmation
  const [confirmed, setConfirmed] = useState(false);

  const onCheckLocation = async () => {
    if (!street.trim() || !houseNo.trim()) return;
    setChecking(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1200));
    setChecking(false);
    setStep(1);
  };

  const onSelectPackage = (id: string) => {
    setSelectedPkg(id);
    setStep(2);
  };

  const onSubmitDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch("/api/signup/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...details,
          package_id: selectedPkg,
          street_address: street,
          house_no: houseNo,
        }),
      });
      setSubmitting(false);
      setConfirmed(true);
      setStep(3);
    } catch {
      setSubmitting(false);
    }
  };

  const resetWizard = () => {
    setStep(0);
    setStreet("");
    setHouseNo("");
    setSelectedPkg(undefined);
    setDetails({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      installation_date: "",
      notes: "",
    });
    setConfirmed(false);
  };

  return (
    <>
      <PageBanner
        title="Forfaits internet"
        subtitle="A la maison ou au travail, parcourir, streamer ou télécharger, Liquid Home met à votre disposition une réponse ultra-rapide, illimitée et abordable."
      />

      {/* Wizard */}
      <section className="py-10 bg-brand-soft">
        <div className="max-w-4xl mx-auto px-4">
          {/* Stepper */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mb-6">
            <div className="flex items-center justify-between">
              {STEPS.map((s, i) => {
                const done = i < step;
                const active = i === step;
                return (
                  <div key={s.id} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center gap-2">
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all ${
                          done
                            ? "bg-brand-orange border-brand-orange text-white"
                            : active
                            ? "bg-white border-brand-orange text-brand-orange"
                            : "bg-white border-gray-300 text-gray-400"
                        }`}
                      >
                        {done ? <Check className="h-5 w-5" /> : i + 1}
                      </div>
                      <span
                        className={`text-xs font-medium ${
                          active || done ? "text-brand-navy" : "text-gray-400"
                        }`}
                      >
                        {s.label}
                      </span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div
                        className={`flex-1 h-0.5 mx-2 -mt-6 ${
                          i < step ? "bg-brand-orange" : "bg-gray-200"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step content */}
          <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-gray-100">
            {/* STEP 1: Location */}
            {step === 0 && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-brand-navy mb-2">
                    Découvrez si vous pouvez bénéficier de nos services
                  </h2>
                  <p className="text-brand-muted">
                    Entrer les détails de votre maison pour voir si vous pouvez bénéficier de nos services
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Form */}
                  <div className="space-y-4">
                    <button
                      type="button"
                      onClick={() => {
                        // Simulate geolocation - center pin
                        setPinPos({ x: 50 + (Math.random() - 0.5) * 10, y: 50 + (Math.random() - 0.5) * 10 });
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-md bg-brand-navy text-white font-semibold text-sm hover:bg-brand-navy-light transition-colors"
                    >
                      <LocateFixed className="h-4 w-4" />
                      Utiliser ma location
                    </button>
                    <p className="text-xs text-brand-muted text-center -mt-2">
                      Recommandé pour des informations exactes sur la couverture
                    </p>

                    <div className="relative">
                      <div className="absolute left-0 right-0 flex items-center">
                        <span className="w-full border-t border-gray-200" />
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span className="bg-white px-3 text-brand-muted uppercase">OU</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-brand-navy mb-2">
                        Adresse de la Rue
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-muted" />
                        <input
                          type="text"
                          value={street}
                          onChange={(e) => setStreet(e.target.value)}
                          placeholder="Ex: Avenue de la Justice"
                          className="input-brand pl-10"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-brand-navy mb-2">
                        N° de la Maison
                      </label>
                      <div className="relative">
                        <HomeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-muted" />
                        <input
                          type="text"
                          value={houseNo}
                          onChange={(e) => setHouseNo(e.target.value)}
                          placeholder="Ex: 142"
                          className="input-brand pl-10"
                        />
                      </div>
                    </div>

                    <button
                      onClick={onCheckLocation}
                      disabled={!street.trim() || !houseNo.trim() || checking}
                      className="btn-brand btn-brand-block btn-brand-lg"
                    >
                      {checking ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Checking availability...
                        </>
                      ) : (
                        <>
                          <Lock className="h-4 w-4" />
                          Adresse de verrouillage
                        </>
                      )}
                    </button>
                  </div>

                  {/* Map */}
                  <div>
                    <div className="text-sm font-medium text-brand-navy mb-2">
                      Disponibilité
                    </div>
                    <p className="text-xs text-brand-muted mb-3">
                      Vous pouvez glisser et déposer l'épingle sur la carte pour
                      choisir avec précision votre emplacement.
                    </p>
                    <div
                      className="relative aspect-square w-full rounded-lg overflow-hidden border-2 border-gray-200 cursor-crosshair"
                      style={{
                        background:
                          "linear-gradient(135deg, #e8eef5 0%, #d6e4f0 50%, #c9dde8 100%)",
                      }}
                      onMouseMove={(e) => {
                        if (e.buttons === 1) {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const x = ((e.clientX - rect.left) / rect.width) * 100;
                          const y = ((e.clientY - rect.top) / rect.height) * 100;
                          setPinPos({
                            x: Math.max(5, Math.min(95, x)),
                            y: Math.max(5, Math.min(95, y)),
                          });
                        }
                      }}
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = ((e.clientX - rect.left) / rect.width) * 100;
                        const y = ((e.clientY - rect.top) / rect.height) * 100;
                        setPinPos({ x, y });
                      }}
                    >
                      {/* Grid streets */}
                      <div
                        className="absolute inset-0 opacity-30"
                        style={{
                          backgroundImage:
                            "linear-gradient(#9bb5cf 2px, transparent 2px), linear-gradient(90deg, #9bb5cf 2px, transparent 2px)",
                          backgroundSize: "40px 40px",
                        }}
                      />
                      {/* River */}
                      <div className="absolute top-1/3 left-0 right-0 h-8 bg-[#a8c8e0] opacity-50 rotate-3" />
                      {/* Coverage circle */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-40 w-40 rounded-full bg-brand-orange/20 border-2 border-dashed border-brand-orange/50" />
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-24 w-24 rounded-full bg-brand-orange/30" />
                      {/* Pin */}
                      <button
                        className="absolute -translate-x-1/2 -translate-y-full z-10 text-brand-orange hover:scale-110 transition-transform cursor-grab active:cursor-grabbing"
                        style={{ left: `${pinPos.x}%`, top: `${pinPos.y}%` }}
                        aria-label="Déplacer l'épingle"
                      >
                        <MapPin className="h-9 w-9 drop-shadow-lg" fill="currentColor" />
                      </button>
                      {/* Label */}
                      <div className="absolute bottom-2 left-2 right-2 bg-white/95 backdrop-blur rounded-md px-3 py-2 text-xs">
                        <p className="text-brand-muted">Position sélectionnée</p>
                        <p className="font-bold text-brand-navy">
                          {pinPos.x.toFixed(1)}, {pinPos.y.toFixed(1)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Offers */}
            {step === 1 && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-brand-navy mb-2">
                    Choisissez votre forfait Libota
                  </h2>
                  <p className="text-brand-muted">
                    Adresse vérifiée : {street}, N° {houseNo} — La fibre est disponible ! 🎉
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {PACKAGES.map((pkg) => {
                    const Icon = pkg.id === "libota-flex" ? Wifi : pkg.id === "libota-super" ? CheckCircle2 : CheckCircle2;
                    const isSelected = selectedPkg === pkg.id;
                    return (
                      <button
                        key={pkg.id}
                        onClick={() => onSelectPackage(pkg.id)}
                        className={`text-left rounded-xl border-2 overflow-hidden transition-all ${
                          isSelected
                            ? "border-brand-orange shadow-lg"
                            : "border-gray-100 hover:border-brand-orange/50"
                        } ${pkg.highlighted ? "ring-2 ring-brand-orange/30" : ""}`}
                      >
                        <div className={`p-4 text-center ${pkg.highlighted ? "bg-brand-orange text-white" : "bg-brand-navy text-white"}`}>
                          <Icon className="h-6 w-6 mx-auto mb-1" />
                          <h3 className="font-bold">{pkg.name}</h3>
                        </div>
                        <div className="p-4 text-center">
                          <div className="flex items-end justify-center gap-1">
                            <span className="text-xs font-semibold text-brand-muted">
                              {pkg.currency}
                            </span>
                            <span className="text-3xl font-extrabold text-brand-orange">
                              {pkg.price}
                            </span>
                            <span className="text-xs text-brand-muted mb-1">/mois</span>
                          </div>
                          <p className="text-xs text-brand-muted mt-1">{pkg.speed}</p>
                          <div className="mt-3 flex items-center justify-center gap-1 text-xs font-semibold text-brand-navy">
                            {isSelected && <Check className="h-3.5 w-3.5 text-brand-orange" />}
                            {isSelected ? "Sélectionné" : "Choisir"}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-6 flex justify-between">
                  <button
                    onClick={() => setStep(0)}
                    className="text-sm text-brand-muted hover:text-brand-navy flex items-center gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Retour
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Details */}
            {step === 2 && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-brand-navy mb-2">
                    Vos coordonnées
                  </h2>
                  <p className="text-brand-muted">
                    Forfait sélectionné :{" "}
                    <span className="font-semibold text-brand-orange">
                      {PACKAGES.find((p) => p.id === selectedPkg)?.name}
                    </span>
                  </p>
                </div>

                <form onSubmit={onSubmitDetails} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DetailField
                    label="Prénom"
                    icon={User}
                    value={details.first_name}
                    onChange={(v) => setDetails((d) => ({ ...d, first_name: v }))}
                    required
                  />
                  <DetailField
                    label="Nom"
                    icon={User}
                    value={details.last_name}
                    onChange={(v) => setDetails((d) => ({ ...d, last_name: v }))}
                    required
                  />
                  <DetailField
                    label="Email"
                    icon={Mail}
                    type="email"
                    value={details.email}
                    onChange={(v) => setDetails((d) => ({ ...d, email: v }))}
                    required
                  />
                  <DetailField
                    label="Téléphone"
                    icon={Phone}
                    type="tel"
                    value={details.phone}
                    onChange={(v) => setDetails((d) => ({ ...d, phone: v }))}
                    required
                  />
                  <DetailField
                    label="Date d'installation souhaitée"
                    icon={Calendar}
                    type="date"
                    value={details.installation_date}
                    onChange={(v) => setDetails((d) => ({ ...d, installation_date: v }))}
                    required
                  />
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-brand-navy mb-2">
                      Notes (optionnel)
                    </label>
                    <textarea
                      value={details.notes}
                      onChange={(e) =>
                        setDetails((d) => ({ ...d, notes: e.target.value }))
                      }
                      rows={3}
                      placeholder="Informations complémentaires pour l'installation..."
                      className="input-brand resize-y"
                    />
                  </div>

                  <div className="md:col-span-2 flex justify-between mt-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-sm text-brand-muted hover:text-brand-navy flex items-center gap-1"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Retour
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-brand btn-brand-lg"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Soumission...
                        </>
                      ) : (
                        <>
                          Confirmer la commande
                          <ChevronRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* STEP 4: Confirmation */}
            {step === 3 && confirmed && (
              <div className="text-center py-6">
                <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="h-12 w-12 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-brand-navy mb-2 flex items-center justify-center gap-2">
                  <PartyPopper className="h-7 w-7 text-brand-orange" />
                  Commande confirmée !
                </h2>
                <p className="text-brand-muted max-w-md mx-auto mb-6">
                  Merci {details.first_name || "à vous"} ! Votre demande d'abonnement au
                  forfait{" "}
                  <span className="font-semibold text-brand-orange">
                    {PACKAGES.find((p) => p.id === selectedPkg)?.name}
                  </span>{" "}
                  a bien été enregistrée. Notre équipe vous contactera sous 24h au {details.phone || "numéro indiqué"}.
                </p>

                <div className="bg-brand-soft rounded-lg p-4 max-w-md mx-auto mb-6 text-left text-sm">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-brand-muted text-xs">Adresse</p>
                      <p className="font-semibold text-brand-navy">{street}, {houseNo}</p>
                    </div>
                    <div>
                      <p className="text-brand-muted text-xs">Forfait</p>
                      <p className="font-semibold text-brand-navy">
                        {PACKAGES.find((p) => p.id === selectedPkg)?.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-brand-muted text-xs">Email</p>
                      <p className="font-semibold text-brand-navy">{details.email}</p>
                    </div>
                    <div>
                      <p className="text-brand-muted text-xs">Délai installation</p>
                      <p className="font-semibold text-brand-navy">≤ 5 jours ouvrés</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button onClick={resetWizard} className="btn-brand">
                    Nouvelle commande
                  </button>
                  <button
                    onClick={() => navigate("home")}
                    className="px-6 py-3 rounded-md border-2 border-brand-navy text-brand-navy font-semibold hover:bg-brand-navy hover:text-white transition-colors"
                  >
                    Retour à l'accueil
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function DetailField({
  label,
  icon: Icon,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  icon: typeof User;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
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
          className="input-brand pl-10"
        />
      </div>
    </div>
  );
}
