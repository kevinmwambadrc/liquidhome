"use client";

import { useState } from "react";
import { MapPin, Search, Loader2, CheckCircle2, XCircle } from "lucide-react";

export function AvailabilityChecker() {
  const [street, setStreet] = useState("");
  const [houseNo, setHouseNo] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<null | { ok: boolean; message: string }>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!street.trim() || !houseNo.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/signup/location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ street_address: street, house_no: houseNo }),
      });
      const data = await res.json();
      setResult({
        ok: !!data.available,
        message:
          data.message ||
          (data.available
            ? "Excellente nouvelle ! La fibre Liquid Home est disponible à cette adresse."
            : "Désolé, la fibre n'est pas encore disponible à cette adresse. Contactez-nous au 4757."),
      });
    } catch {
      setResult({ ok: false, message: "Une erreur est survenue. Réessayez plus tard." });
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
            <span className="text-sm font-medium">
              Vérifiez quel forfait internet est disponible dans votre zone
            </span>
          </div>
          <form onSubmit={onSubmit} className="flex flex-1 flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              placeholder="adresse de l'avenue"
              className="flex-1 rounded-md px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/30"
              required
            />
            <input
              type="text"
              value={houseNo}
              onChange={(e) => setHouseNo(e.target.value)}
              placeholder="N° de la Maison"
              className="sm:w-40 rounded-md px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/30"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="btn-brand btn-brand-block sm:btn-brand-block sm:w-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Recherche...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Recherche
                </>
              )}
            </button>
          </form>
        </div>

        {result && (
          <div
            className={`mt-3 flex items-start gap-2 rounded-md px-4 py-2.5 text-sm ${
              result.ok
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-orange-50 text-orange-900 border border-orange-200"
            }`}
          >
            {result.ok ? (
              <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
            ) : (
              <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            )}
            <span>{result.message}</span>
          </div>
        )}
      </div>
    </section>
  );
}
