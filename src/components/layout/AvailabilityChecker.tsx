"use client";

import { useState } from "react";
import { MapPin, Search, Loader2, CheckCircle2, XCircle, BellPlus } from "lucide-react";
import { useRouter } from "@/lib/router";
import { CoverageRequestModal } from "@/components/widgets/CoverageRequestModal";

interface CheckResult {
  available: boolean;
  message: string;
  zone: string | null;
  lat?: number | null;
  lng?: number | null;
}

export function AvailabilityChecker() {
  const { t, language } = useRouter();
  const [street, setStreet] = useState("");
  const [houseNo, setHouseNo] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckResult | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!street.trim() || !houseNo.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      // 1. Geocode the typed address into precise GPS coordinates
      const geoRes = await fetch(
        `/api/geocode?q=${encodeURIComponent(`${street}, Kinshasa`)}`
      );
      const geo = await geoRes.json();
      const hit = geo.results?.[0];

      // 2. Check fiber coverage at those coordinates
      const res = await fetch("/api/signup/location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          street_address: street,
          house_no: houseNo,
          lat: hit?.lat,
          lng: hit?.lng,
        }),
      });
      const data = await res.json();
      setResult({
        available: !!data.available,
        message:
          data.message ||
          (data.available
            ? "Excellente nouvelle ! La fibre Liquid Home est disponible à cette adresse."
            : "Désolé, la fibre n'est pas encore disponible à cette adresse. Contactez-nous au 4757."),
        zone: data.zone ?? null,
        lat: hit?.lat ?? null,
        lng: hit?.lng ?? null,
      });
    } catch {
      setResult({
        available: false,
        message: language === "en" ? "An error occurred. Try again later." : "Une erreur est survenue. Réessayez plus tard.",
        zone: null,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-brand-navy-light text-white">
      <div className="max-w-7xl mx-auto px-4 py-5">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex items-center gap-2 md:flex-shrink-0">
            <MapPin className="h-5 w-5 text-brand-orange" />
            <span className="text-sm font-medium">{t("checker.title")}</span>
          </div>
          <form onSubmit={onSubmit} className="flex flex-1 flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              placeholder={t("checker.street")}
              className="flex-1 rounded-md px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/30"
              required
            />
            <input
              type="text"
              value={houseNo}
              onChange={(e) => setHouseNo(e.target.value)}
              placeholder={t("checker.house")}
              className="sm:w-40 rounded-md px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/30"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="btn-brand sm:w-auto whitespace-nowrap"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("checker.searching")}
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  {t("checker.search")}
                </>
              )}
            </button>
          </form>
        </div>

        {result && (
          <div
            className={`mt-3 rounded-md px-4 py-2.5 text-sm flex flex-wrap items-center gap-2 ${
              result.available
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-orange-50 text-orange-900 border border-orange-200"
            }`}
          >
            {result.available ? (
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
            ) : (
              <XCircle className="h-4 w-4 flex-shrink-0" />
            )}
            <span className="flex-1 min-w-48">{result.message}</span>
            {!result.available && (
              <button
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-brand-orange text-white text-xs font-semibold hover:bg-brand-orange-hover transition-colors"
              >
                <BellPlus className="h-3.5 w-3.5" />
                {t("signup.requestCoverage")}
              </button>
            )}
          </div>
        )}
      </div>

      <CoverageRequestModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        address={street}
        houseNo={houseNo}
        lat={result?.lat ?? null}
        lng={result?.lng ?? null}
        commune={result?.zone ?? null}
      />
    </section>
  );
}
