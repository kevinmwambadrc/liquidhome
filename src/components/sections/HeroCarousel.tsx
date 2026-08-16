"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BANNERS } from "@/lib/content";
import { useRouter } from "@/lib/router";

export function HeroCarousel() {
  const [active, setActive] = useState(0);
  const { navigate } = useRouter();
  const count = BANNERS.length;

  const next = useCallback(() => setActive((i) => (i + 1) % count), [count]);
  const prev = useCallback(() => setActive((i) => (i - 1 + count) % count), [count]);

  useEffect(() => {
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [next]);

  return (
    <div className="relative w-full bg-brand-navy overflow-hidden">
      <div className="relative h-[260px] sm:h-[360px] md:h-[460px] lg:h-[540px]">
        {BANNERS.map((b, i) => (
          <button
            key={b.id}
            onClick={() => navigate("packages")}
            className={`absolute inset-0 transition-opacity duration-700 ${
              i === active ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
            aria-label={b.alt}
          >
            <Image
              src={b.src}
              alt={b.alt}
              fill
              priority={i === 0}
              sizes="100vw"
              className="object-cover"
            />
            {/* Overlay text - using the banner's own embedded text, but adding subtle gradient for legibility on small screens */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-transparent md:hidden" />
          </button>
        ))}
      </div>

      {/* Arrows - desktop */}
      <button
        onClick={prev}
        aria-label="Précédent"
        className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 items-center justify-center rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur transition-colors"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={next}
        aria-label="Suivant"
        className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 items-center justify-center rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur transition-colors"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {BANNERS.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            aria-label={`Aller à la bannière ${i + 1}`}
            className={`h-2 rounded-full transition-all ${
              i === active ? "w-6 bg-brand-orange" : "w-2 bg-white/60 hover:bg-white"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
