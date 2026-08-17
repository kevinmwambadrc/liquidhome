"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { PageBanner } from "@/components/sections/PageBanner";
import { useRouter } from "@/lib/router";
import type { CoverageZone } from "@/lib/coverage";
import { KINSHASA_CENTER } from "@/lib/coverage";
import { CoverageRequestModal } from "@/components/widgets/CoverageRequestModal";
import {
  MapPin,

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
  XCircle,
  MapPinned,
  BellPlus,
  Search,
  IdCard,
  Upload,
} from "lucide-react";

// Dynamically import the real Leaflet map (client-only, no SSR)
const CoverageMap = dynamic(() => import("@/components/widgets/CoverageMap"), {
  ssr: false,
  loading: () => (
    <div className="aspect-square w-full rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <MapPin className="h-8 w-8 text-brand-orange mx-auto mb-2 animate-pulse" />
        <p className="text-sm text-brand-muted">Chargement de la carte...</p>
      </div>
    </div>
  ),
});

interface DbPackage {
  id: string;
  slug: string;
  name: string;
  price: number;
  currency: string;
  speed: string;
  highlighted: boolean;
  badge: string | null;
}

export function SignupPage() {
  const { signupPackage, navigate, language, t } = useRouter();
  const [step, setStep] = useState(0);
  const [packages, setPackages] = useState<DbPackage[]>([]);

  useEffect(() => {
    fetch("/api/packages", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setPackages(d.packages ?? []))
      .catch(() => setPackages([]));
  }, []);

  // Step 1 - location
  const [street, setStreet] = useState("");
  const [houseNo, setHouseNo] = useState("");
  const [mapPos, setMapPos] = useState<{ lat: number; lng: number }>({
    lat: KINSHASA_CENTER[0],
    lng: KINSHASA_CENTER[1],
  });
  const [currentZone, setCurrentZone] = useState<CoverageZone | null>(null);
  const [checking, setChecking] = useState(false);
  const [covReqOpen, setCovReqOpen] = useState(false);

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
  const [kyc, setKyc] = useState<{ docType: string; docUrl: string | null; uploading: boolean }>({
    docType: "",
    docUrl: null,
    uploading: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [orderRef, setOrderRef] = useState<string | null>(null);
  const [accountCreated, setAccountCreated] = useState(false);

  // Step 4 - confirmation
  const [confirmed, setConfirmed] = useState(false);

  const onCheckLocation = async () => {
    if (!street.trim() || !houseNo.trim()) return;
    setChecking(true);
    try {
      // Geocode the typed address into real GPS coordinates and move the pin
      let pos = mapPos;
      try {
        const geoRes = await fetch(`/api/geocode?q=${encodeURIComponent(`${street}, Kinshasa`)}`);
        const geo = await geoRes.json();
        if (geo.results?.[0]) {
          pos = { lat: geo.results[0].lat, lng: geo.results[0].lng };
          setMapPos(pos);
        }
      } catch {
        // keep the manual pin position if geocoding fails
      }

      const res = await fetch("/api/signup/location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          street_address: street,
          house_no: houseNo,
          lat: pos.lat,
          lng: pos.lng,
        }),
      });
      const data = await res.json();
      if (data.zone) {
        setCurrentZone({
          id: data.zone,
          name: data.zone,
          commune: data.zone,
          polygon: [],
          status: data.available ? "available" : "coming-soon",
          color: data.available ? "#F89E3C" : "#888888",
        });
      } else {
        setCurrentZone(null);
      }
    } catch {
      setCurrentZone(null);
    } finally {
      setChecking(false);
    }
  };

  const goToOffers = () => setStep(1);

  const onSelectPackage = (slug: string) => {
    setSelectedPkg(slug);
    setStep(2);
  };

  const onSubmitDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/signup/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...details,
          package_id: selectedPkg,
          street_address: street,
          house_no: houseNo,
          commune: currentZone?.commune ?? null,
          lat: mapPos.lat,
          lng: mapPos.lng,
          kyc_doc_type: kyc.docType || undefined,
          kyc_doc_url: kyc.docUrl || undefined,
        }),
      });
      const data = await res.json();
      setOrderRef(data.order_ref ?? null);
      setAccountCreated(!!data.account_created);
      setSubmitting(false);
      setConfirmed(!!data.ok);
      setStep(3);
    } catch {
      setSubmitting(false);
    }
  };

  const resetWizard = () => {
    setStep(0);
    setStreet("");
    setHouseNo("");
    setMapPos({ lat: KINSHASA_CENTER[0], lng: KINSHASA_CENTER[1] });
    setCurrentZone(null);
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
    setOrderRef(null);
    setAccountCreated(false);
    setKyc({ docType: "", docUrl: null, uploading: false });
  };

  const STEPS = [
    { id: "location", label: t("signup.stepLocation") },
    { id: "offers", label: t("signup.stepOffers") },
    { id: "details", label: t("signup.stepDetails") },
    { id: "confirmation", label: t("signup.stepConfirm") },
  ];

  return (
    <>
      <PageBanner title={t("signup.title")} subtitle={t("packages.subtitle")} />

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
                    {t("signup.findOut")}
                  </h2>
                  <p className="text-brand-muted">{t("signup.findOutSub")}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Form */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-brand-navy mb-2">
                        {t("signup.street")} <span className="text-brand-orange">*</span>
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-muted" />
                        <input
                          type="text"
                          value={street}
                          onChange={(e) => setStreet(e.target.value)}
                          placeholder={language === "en" ? "E.g. Avenue de la Justice" : "Ex: Avenue de la Justice"}
                          className="input-brand pl-10"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-brand-navy mb-2">
                        {t("signup.house")} <span className="text-brand-orange">*</span>
                      </label>
                      <div className="relative">
                        <HomeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-muted" />
                        <input
                          type="text"
                          value={houseNo}
                          onChange={(e) => setHouseNo(e.target.value)}
                          placeholder={language === "en" ? "E.g. 142" : "Ex: 142"}
                          className="input-brand pl-10"
                        />
                      </div>
                    </div>

                    {/* Coverage status indicator */}
                    {currentZone && (
                      <div
                        className={`rounded-md border p-3 flex items-start gap-2 ${
                          currentZone.status === "available"
                            ? "bg-green-50 border-green-200 text-green-800"
                            : "bg-orange-50 border-orange-200 text-orange-800"
                        }`}
                      >
                        {currentZone.status === "available" ? (
                          <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="text-sm">
                          <p className="font-semibold">
                            {language === "en" ? "Area" : "Commune"} : {currentZone.name}
                          </p>
                          {currentZone.status === "available" ? (
                            <p>{language === "en" ? "Liquid Home fiber is available in this area! 🎉" : "La fibre Liquid Home est disponible dans cette zone ! 🎉"}</p>
                          ) : (
                            <p>{language === "en" ? "This area will be covered soon. Contact us at 4757." : "Cette zone sera bientôt couverte. Contactez-nous au 4757."}</p>
                          )}
                        </div>
                      </div>
                    )}

                    <button
                      onClick={onCheckLocation}
                      disabled={!street.trim() || !houseNo.trim() || checking}
                      className="btn-brand btn-brand-block btn-brand-lg"
                    >
                      {checking ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {t("signup.checking")}
                        </>
                      ) : (
                        <>
                          <Search className="h-4 w-4" />
                          {t("signup.lockAddr")}
                        </>
                      )}
                    </button>

                    {/* Continue / request coverage based on the real result */}
                    {currentZone && !checking && (
                      currentZone.status === "available" ? (
                        <button onClick={goToOffers} className="btn-navy btn-brand-block w-full py-3.5">
                          {language === "en" ? "Continue to plans" : "Continuer vers les offres"}
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => setCovReqOpen(true)}
                          className="btn-navy btn-brand-block w-full py-3.5"
                        >
                          <BellPlus className="h-4 w-4" />
                          {t("signup.requestCoverage")}
                        </button>
                      )
                    )}

                    {/* Coordinates display */}
                    <div className="bg-brand-soft rounded-md p-3 text-xs">
                      <p className="text-brand-muted flex items-center gap-1.5 mb-1">
                        <MapPinned className="h-3.5 w-3.5" />
                        {t("signup.gps")}
                      </p>
                      <p className="font-mono font-semibold text-brand-navy">
                        {mapPos.lat.toFixed(5)}, {mapPos.lng.toFixed(5)}
                      </p>
                    </div>
                  </div>

                  {/* Real interactive map (Leaflet) */}
                  <div>
                    <div className="text-sm font-medium text-brand-navy mb-2">
                      {t("signup.availability")}
                    </div>
                    <p className="text-xs text-brand-muted mb-3">{t("signup.mapHint")}</p>
                    <CoverageMap
                      position={mapPos}
                      onPositionChange={setMapPos}
                      onZoneChange={setCurrentZone}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Offers */}
            {step === 1 && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-brand-navy mb-2">
                    {t("signup.choosePlan")}
                  </h2>
                  <p className="text-brand-muted">
                    {t("signup.addrVerified")} : <span className="font-semibold text-brand-navy">{street}, {language === "en" ? "No." : "N°"} {houseNo}</span>
                    {currentZone && (
                      <>
                        {" — "}
                        <span className={`font-semibold ${currentZone.status === "available" ? "text-green-600" : "text-orange-600"}`}>
                          {currentZone.name} ({currentZone.status === "available" ? t("signup.fiberAvail") : t("signup.soon")})
                        </span>
                      </>
                    )}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {packages.map((pkg) => {
                    const isSelected = selectedPkg === pkg.slug;
                    return (
                      <button
                        key={pkg.id}
                        onClick={() => onSelectPackage(pkg.slug)}
                        className={`text-left rounded-xl border-2 overflow-hidden transition-all ${
                          isSelected
                            ? "border-brand-orange shadow-lg"
                            : "border-gray-100 hover:border-brand-orange/50"
                        } ${pkg.highlighted ? "ring-2 ring-brand-orange/30" : ""}`}
                      >
                        <div className={`p-4 text-center ${pkg.highlighted ? "bg-brand-orange text-white" : "bg-brand-navy text-white"}`}>
                          <Wifi className="h-6 w-6 mx-auto mb-1" />
                          <h3 className="font-bold">{pkg.name}</h3>
                        </div>
                        <div className="p-4 text-center">
                          <div className="flex items-end justify-center gap-1">
                            <span className="text-xs font-semibold text-brand-muted">{pkg.currency}</span>
                            <span className="text-3xl font-extrabold text-brand-orange">{pkg.price}</span>
                            <span className="text-xs text-brand-muted mb-1">{t("packages.month")}</span>
                          </div>
                          <p className="text-xs text-brand-muted mt-1">{pkg.speed}</p>
                          <div className="mt-3 flex items-center justify-center gap-1 text-xs font-semibold text-brand-navy">
                            {isSelected && <Check className="h-3.5 w-3.5 text-brand-orange" />}
                            {isSelected ? t("signup.selected") : t("signup.chooseBtn")}
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
                    {t("signup.back")}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Details */}
            {step === 2 && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-brand-navy mb-2">{t("signup.yourDetails")}</h2>
                  <p className="text-brand-muted">
                    {t("signup.selectedPlan")} :{" "}
                    <span className="font-semibold text-brand-orange">
                      {packages.find((p) => p.slug === selectedPkg)?.name}
                    </span>
                  </p>
                </div>

                <form onSubmit={onSubmitDetails} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DetailField
                    label={t("signup.firstname")}
                    icon={User}
                    value={details.first_name}
                    onChange={(v) => setDetails((d) => ({ ...d, first_name: v }))}
                    required
                  />
                  <DetailField
                    label={t("signup.lastname")}
                    icon={User}
                    value={details.last_name}
                    onChange={(v) => setDetails((d) => ({ ...d, last_name: v }))}
                    required
                  />
                  <DetailField
                    label={t("signup.email")}
                    icon={Mail}
                    type="email"
                    value={details.email}
                    onChange={(v) => setDetails((d) => ({ ...d, email: v }))}
                    required
                  />
                  <DetailField
                    label={t("signup.phone")}
                    icon={Phone}
                    type="tel"
                    value={details.phone}
                    onChange={(v) => setDetails((d) => ({ ...d, phone: v }))}
                    required
                  />
                  <DetailField
                    label={t("signup.instDate")}
                    icon={Calendar}
                    type="date"
                    value={details.installation_date}
                    onChange={(v) => setDetails((d) => ({ ...d, installation_date: v }))}
                    required
                  />
                  <div className="md:col-span-2">
                    <div className="rounded-xl border border-brand-navy/20 bg-brand-soft/50 p-4">
                      <p className="text-sm font-semibold text-brand-navy mb-1 flex items-center gap-2">
                        <IdCard className="h-4 w-4 text-brand-orange" />
                        Pièce d'identité (KYC) <span className="text-brand-orange">*</span>
                      </p>
                      <p className="text-xs text-brand-muted mb-3">
                        {language === "en"
                          ? "Required to activate your line: upload a valid ID (passport, voter card or driving license). Our team verifies it, usually within 24h."
                          : "Obligatoire pour activer votre ligne : téléversez une pièce valide (passeport, carte d'électeur ou permis de conduire). Notre équipe la vérifie, généralement sous 24h."}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
                        {[
                          { id: "passport", label: language === "en" ? "Passport" : "Passeport" },
                          { id: "voter", label: language === "en" ? "Voter card" : "Carte d'électeur" },
                          { id: "license", label: language === "en" ? "Driving license" : "Permis de conduire" },
                        ].map((d) => (
                          <button
                            key={d.id}
                            type="button"
                            onClick={() => setKyc((k) => ({ ...k, docType: d.id }))}
                            className={`px-3 py-2.5 rounded-lg text-sm font-semibold border-2 transition-all ${
                              kyc.docType === d.id
                                ? "border-brand-orange bg-orange-50 text-brand-navy"
                                : "border-gray-200 bg-white text-brand-muted hover:border-brand-orange/40"
                            }`}
                          >
                            {d.label}
                          </button>
                        ))}
                      </div>
                      {kyc.docType && (
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                          <label className="btn-navy text-xs cursor-pointer">
                            <Upload className="h-3.5 w-3.5" />
                            {kyc.uploading ? (language === "en" ? "Uploading..." : "Téléversement...") : kyc.docUrl ? (language === "en" ? "Replace file" : "Remplacer le fichier") : (language === "en" ? "Upload document" : "Téléverser le document")}
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp,application/pdf"
                              className="hidden"
                              onChange={async (e) => {
                                const f = e.target.files?.[0];
                                if (!f) return;
                                setKyc((k) => ({ ...k, uploading: true }));
                                try {
                                  const fd = new FormData();
                                  fd.append("file", f);
                                  const res = await fetch("/api/uploads", { method: "POST", body: fd });
                                  const data = await res.json();
                                  if (data.ok) setKyc((k) => ({ ...k, docUrl: data.url }));
                                  else alert(data.message ?? "Échec du téléversement");
                                } finally {
                                  setKyc((k) => ({ ...k, uploading: false }));
                                }
                              }}
                            />
                          </label>
                          {kyc.docUrl && (
                            <span className="text-xs text-green-700 flex items-center gap-1.5">
                              <CheckCircle2 className="h-4 w-4" />
                              {language === "en" ? "Document uploaded" : "Document téléversé"} ✓
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <div className="rounded-xl border border-brand-orange/30 bg-orange-50/60 p-4 flex items-start gap-3">
                      <Mail className="h-5 w-5 text-brand-orange flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-brand-navy">
                          {language === "en" ? "Your MyLiquid access by email" : "Votre accès MyLiquid par email"}
                        </p>
                        <p className="text-xs text-brand-muted mt-1">
                          {language === "en"
                            ? "After confirmation, we email your login and a temporary password — you will choose your own password at first sign-in."
                            : "Après confirmation, nous vous envoyons par email vos identifiants et un mot de passe provisoire — vous choisirez votre propre mot de passe à la première connexion."}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-brand-navy mb-2">
                      {t("signup.notes")}
                    </label>
                    <textarea
                      value={details.notes}
                      onChange={(e) => setDetails((d) => ({ ...d, notes: e.target.value }))}
                      rows={3}
                      placeholder={t("signup.notesPh")}
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
                      {t("signup.back")}
                    </button>
                    <button type="submit" disabled={submitting} className="btn-brand btn-brand-lg">
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {t("signup.submitting")}
                        </>
                      ) : (
                        <>
                          {t("signup.confirm")}
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
                  {t("signup.confirmed")}
                </h2>
                <p className="text-brand-muted max-w-md mx-auto mb-2">
                  {language === "en"
                    ? `Thank you ${details.first_name || ""}! Your subscription request for`
                    : `Merci ${details.first_name || "à vous"} ! Votre demande d'abonnement au forfait`}{" "}
                  <span className="font-semibold text-brand-orange">
                    {packages.find((p) => p.slug === selectedPkg)?.name}
                  </span>{" "}
                  {language === "en"
                    ? "has been recorded. Our team will contact you within 24h."
                    : "a bien été enregistrée. Notre équipe vous contactera sous 24h."}
                </p>
                {orderRef && (
                  <p className="text-sm text-brand-navy mb-1">
                    {language === "en" ? "Order reference" : "Référence de commande"} :{" "}
                    <span className="font-mono font-bold text-brand-navy bg-brand-soft px-2 py-1 rounded">{orderRef}</span>
                  </p>
                )}
                {accountCreated && (
                  <p className="text-sm text-green-700 mb-6 max-w-md mx-auto">
                    ✓ {language === "en"
                      ? `Your MyLiquid account is created. Your login and a temporary password have been emailed to ${details.email} — you will choose your own password at first sign-in.`
                      : `Votre compte MyLiquid est créé. Vos identifiants et un mot de passe provisoire ont été envoyés à ${details.email} — vous choisirez votre propre mot de passe à la première connexion.`}
                  </p>
                )}
                {!accountCreated && <div className="mb-6" />}

                <div className="bg-brand-soft rounded-lg p-4 max-w-md mx-auto mb-6 text-left text-sm">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-brand-muted text-xs">{language === "en" ? "Address" : "Adresse"}</p>
                      <p className="font-semibold text-brand-navy">{street}, {houseNo}</p>
                    </div>
                    <div>
                      <p className="text-brand-muted text-xs">{language === "en" ? "Plan" : "Forfait"}</p>
                      <p className="font-semibold text-brand-navy">
                        {packages.find((p) => p.slug === selectedPkg)?.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-brand-muted text-xs">Email</p>
                      <p className="font-semibold text-brand-navy">{details.email}</p>
                    </div>
                    <div>
                      <p className="text-brand-muted text-xs">{language === "en" ? "Installation" : "Délai installation"}</p>
                      <p className="font-semibold text-brand-navy">
                        {language === "en" ? "≤ 5 working days" : "≤ 5 jours ouvrés"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button onClick={resetWizard} className="btn-brand">
                    {t("signup.newOrder")}
                  </button>
                  <button
                    onClick={() => navigate("/")}
                    className="px-6 py-3 rounded-md border-2 border-brand-navy text-brand-navy font-semibold hover:bg-brand-navy hover:text-white transition-colors"
                  >
                    {t("signup.backHome")}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <CoverageRequestModal
        open={covReqOpen}
        onOpenChange={setCovReqOpen}
        address={street}
        houseNo={houseNo}
        lat={mapPos.lat}
        lng={mapPos.lng}
        commune={currentZone?.commune ?? null}
      />
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
