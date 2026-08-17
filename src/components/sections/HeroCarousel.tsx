"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { BANNERS } from "@/lib/content";
import { useRouter } from "@/lib/router";

const DURATION = 6000;

export function HeroCarousel() {
  const [active, setActive] = useState(0);
  const { navigate } = useRouter();
  const count = BANNERS.length;

  const next = useCallback(() => setActive((i) => (i + 1) % count), [count]);
  const prev = useCallback(() => setActive((i) => (i - 1 + count) % count), [count]);

  useEffect(() => {
    const t = setInterval(next, DURATION);
    return () => clearInterval(t);
  }, [next, active]);

  return (
    <div className="relative w-full bg-brand-navy overflow-hidden">
      <div className="relative h-[260px] sm:h-[360px] md:h-[460px] lg:h-[540px]">
        <AnimatePresence initial={false}>
          <motion.button
            key={BANNERS[active].id}
            onClick={() => navigate("/packages")}
            className="absolute inset-0"
            aria-label={BANNERS[active].alt}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            <Image
              src={BANNERS[active].src}
              alt={BANNERS[active].alt}
              fill
              priority={active === 0}
              sizes="100vw"
              className="object-cover"
            />
            {/* Subtle gradient for legibility on small screens */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/25 via-transparent to-transparent md:hidden" />
          </motion.button>
        </AnimatePresence>

        {/* Soft bottom fade into the page */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/25 to-transparent pointer-events-none z-10" />
      </div>

      {/* Arrows - desktop */}
      <button
        onClick={prev}
        aria-label="Précédent"
        className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 h-11 w-11 items-center justify-center rounded-full bg-white/15 hover:bg-white/35 text-white backdrop-blur-md border border-white/20 transition-all hover:scale-110 active:scale-95"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={next}
        aria-label="Suivant"
        className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 h-11 w-11 items-center justify-center rounded-full bg-white/15 hover:bg-white/35 text-white backdrop-blur-md border border-white/20 transition-all hover:scale-110 active:scale-95"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Progress dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {BANNERS.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            aria-label={`Aller à la bannière ${i + 1}`}
            className="group relative h-2.5"
          >
            <span
              className={`block h-2 rounded-full overflow-hidden transition-all duration-500 ${
                i === active ? "w-10 bg-white/30" : "w-2.5 bg-white/50 group-hover:bg-white/80"
              }`}
            >
              {i === active && (
                <motion.span
                  key={`fill-${active}`}
                  className="block h-full bg-brand-orange"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: DURATION / 1000, ease: "linear" }}
                />
              )}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
