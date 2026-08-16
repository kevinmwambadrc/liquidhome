"use client";

import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { useRouter } from "@/lib/router";
import { CONTACT_INFO, SOCIAL_LINKS, LEGAL_LINKS } from "@/lib/content";

export function SiteFooter() {
  const { navigate } = useRouter();

  return (
    <footer className="bg-brand-navy text-white mt-auto">
      {/* Upper footer */}
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
        {/* Col 1 - Legal */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-brand-orange mb-3">
            Légal
          </h3>
          <ul className="space-y-2 text-sm">
            {LEGAL_LINKS.slice(0, 2).map((l) => (
              <li key={l.route}>
                <button
                  onClick={() => navigate(l.route)}
                  className="text-white/80 hover:text-brand-orange transition-colors text-left"
                >
                  {l.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 2 - Usage */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-brand-orange mb-3">
            Informations
          </h3>
          <ul className="space-y-2 text-sm">
            {LEGAL_LINKS.slice(2).map((l) => (
              <li key={l.route}>
                <button
                  onClick={() => navigate(l.route)}
                  className="text-white/80 hover:text-brand-orange transition-colors text-left"
                >
                  {l.label}
                </button>
              </li>
            ))}
            <li>
              <button
                onClick={() => navigate("packages")}
                className="text-white/80 hover:text-brand-orange transition-colors text-left"
              >
                Forfaits Libota
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate("signup")}
                className="text-white/80 hover:text-brand-orange transition-colors text-left"
              >
                Souscrire
              </button>
            </li>
          </ul>
        </div>

        {/* Col 3 - Contact */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-brand-orange mb-3">
            Contact
          </h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-brand-orange flex-shrink-0" />
              <a href="tel:4757" className="text-white/90 hover:text-brand-orange">
                {CONTACT_INFO.shortPhone}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-brand-orange flex-shrink-0" />
              <a
                href={`tel:${CONTACT_INFO.fullPhone.replace(/\s/g, "")}`}
                className="text-white/90 hover:text-brand-orange"
              >
                {CONTACT_INFO.fullPhone}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-brand-orange flex-shrink-0" />
              <a
                href={`mailto:${CONTACT_INFO.email}`}
                className="text-white/90 hover:text-brand-orange break-all"
              >
                {CONTACT_INFO.email}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-brand-orange flex-shrink-0" />
              <span className="text-white/90">{CONTACT_INFO.city}</span>
            </li>
            <li className="flex items-start gap-2">
              <Clock className="h-4 w-4 text-brand-orange flex-shrink-0 mt-0.5" />
              <span className="text-white/90 text-xs leading-relaxed">
                Lun - Ven : {CONTACT_INFO.hoursWeekday}
                <br />
                Week-end : {CONTACT_INFO.hoursWeekend}
              </span>
            </li>
          </ul>
        </div>

        {/* Col 4 - Social */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-brand-orange mb-3">
            Réseaux Sociaux
          </h3>
          <div className="flex flex-wrap gap-2">
            {SOCIAL_LINKS.map((s) => {
              const Icon = s.icon;
              return (
                <a
                  key={s.label}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-social"
                  aria-label={s.label}
                  title={s.label}
                >
                  <Icon className="h-4 w-4" />
                </a>
              );
            })}
          </div>

          {/* Newsletter mini */}
          <div className="mt-6">
            <p className="text-xs text-white/70 mb-2">
              Restez informé des dernières offres
            </p>
            <button
              onClick={() => navigate("home")}
              className="text-xs text-brand-orange hover:underline"
            >
              Voir les forfaits →
            </button>
          </div>
        </div>
      </div>

      {/* Lower footer */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/70">
          <p>© Copyright 2026 Liquid Home. Tous droits réservés.</p>
          <button
            onClick={() => navigate("terms-and-conditions")}
            className="hover:text-brand-orange transition-colors"
          >
            Termes et conditions
          </button>
        </div>
      </div>
    </footer>
  );
}
