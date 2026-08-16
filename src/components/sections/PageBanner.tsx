"use client";

import { ReactNode } from "react";

interface PageBannerProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  align?: "left" | "center";
}

export function PageBanner({ title, subtitle, children, align = "left" }: PageBannerProps) {
  return (
    <section className="bg-brand-navy text-white relative overflow-hidden">
      {/* Decorative gradient accent */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-navy via-brand-navy to-brand-navy-light" />
      <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-brand-orange/10 blur-3xl" />
      <div className="absolute -left-32 -bottom-32 h-96 w-96 rounded-full bg-brand-orange/5 blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 py-12 md:py-16">
        <div className={align === "center" ? "text-center max-w-3xl mx-auto" : "max-w-3xl"}>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-white/85 text-base md:text-lg leading-relaxed">
              {subtitle}
            </p>
          )}
          {children}
        </div>
      </div>
    </section>
  );
}
