"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "@/lib/router";
import { PageBanner } from "@/components/sections/PageBanner";
import { motion } from "framer-motion";
import { Newspaper, GraduationCap, CalendarDays, ArrowRight, Loader2 } from "lucide-react";

interface PostPreview {
  id: string;
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  coverImage: string | null;
  authorName: string;
  createdAt: string;
}

export function InfosPage() {
  const { t, language } = useRouter();
  const [tab, setTab] = useState<"info" | "tuto">("info");
  const [posts, setPosts] = useState<PostPreview[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    const raf = requestAnimationFrame(() => setPosts(null));
    fetch(`/api/posts?category=${tab}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setPosts(d.posts ?? []);
      })
      .catch(() => {
        if (!cancelled) setPosts([]);
      });
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [tab]);

  return (
    <>
      <PageBanner title={t("infos.title")} subtitle={t("infos.subtitle")} />

      <section className="py-12 bg-brand-soft/50 min-h-[50vh]">
        <div className="max-w-7xl mx-auto px-4">
          {/* Tabs */}
          <div className="flex gap-2 mb-8 justify-center">
            <button
              onClick={() => setTab("info")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                tab === "info"
                  ? "bg-brand-navy text-white shadow-md shadow-brand-navy/25"
                  : "bg-white text-brand-muted hover:text-brand-navy border border-gray-100"
              }`}
            >
              <Newspaper className="h-4 w-4" />
              {t("infos.tabNews")}
            </button>
            <button
              onClick={() => setTab("tuto")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                tab === "tuto"
                  ? "bg-brand-navy text-white shadow-md shadow-brand-navy/25"
                  : "bg-white text-brand-muted hover:text-brand-navy border border-gray-100"
              }`}
            >
              <GraduationCap className="h-4 w-4" />
              {t("infos.tabTutos")}
            </button>
          </div>

          {/* Grid */}
          {posts === null ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-brand-orange" />
            </div>
          ) : posts.length === 0 ? (
            <p className="text-center text-brand-muted py-16">{t("infos.empty")}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((p, i) => (
                <motion.article
                  key={p.id}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07, duration: 0.4 }}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-shadow group"
                >
                  <a href={`/infos/${p.slug}`} className="block">
                    <div className="relative h-44 bg-brand-navy">
                      {p.coverImage ? (
                        <Image
                          src={p.coverImage}
                          alt={p.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Newspaper className="h-10 w-10 text-white/30" />
                        </div>
                      )}
                      <span
                        className={`absolute top-3 left-3 text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${
                          p.category === "tuto" ? "bg-brand-orange text-white" : "bg-white/90 text-brand-navy"
                        }`}
                      >
                        {p.category === "tuto"
                          ? language === "en"
                            ? "Tutorial"
                            : "Tutoriel"
                          : language === "en"
                            ? "News"
                            : "Actualité"}
                      </span>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2 text-xs text-brand-muted mb-2">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {new Date(p.createdAt).toLocaleDateString(language === "en" ? "en-GB" : "fr-FR")}
                        <span className="ml-auto font-semibold text-brand-navy/70">{p.authorName}</span>
                      </div>
                      <h3 className="font-bold text-brand-navy text-lg leading-snug mb-2 line-clamp-2">
                        {p.title}
                      </h3>
                      <p className="text-sm text-brand-muted line-clamp-3 mb-4">{p.excerpt}</p>
                      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-orange group-hover:gap-2.5 transition-all">
                        {t("infos.readMore")}
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </a>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
