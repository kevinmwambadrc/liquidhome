"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useRouter } from "@/lib/router";
import { PostBlocks } from "@/components/widgets/PostBlocks";
import { motion } from "framer-motion";
import {
  CalendarDays,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Newspaper,
  GraduationCap,
  Heading2,
  ImageIcon,
  Youtube,
  AudioLines,
  MousePointerClick,
  Quote,
} from "lucide-react";

interface Block {
  type: string;
  text?: string;
  url?: string;
  alt?: string;
  label?: string;
  title?: string;
}

interface FullPost {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  coverImage: string | null;
  authorName: string;
  createdAt: string;
  content: Block[];
}

export function InfosArticlePage() {
  const params = useParams<{ slug: string }>();
  const { t, language } = useRouter();
  const [post, setPost] = useState<FullPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/posts?slug=${params.slug}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setPost(d.post ?? null);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [params.slug]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-orange" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 px-4">
        <Newspaper className="h-12 w-12 text-brand-muted/40" />
        <p className="text-brand-muted">{t("infos.empty")}</p>
        <a href="/infos" className="btn-brand">
          {t("infos.back")}
        </a>
      </div>
    );
  }

  const isExternal = (url: string) => url.startsWith("http");

  return (
    <article className="bg-white min-h-screen">
      {/* Cover */}
      {post.coverImage && (
        <div className="relative h-[280px] md:h-[420px] w-full bg-brand-navy">
          <Image src={post.coverImage} alt={post.title} fill priority className="object-cover" sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0">
            <div className="max-w-3xl mx-auto px-4 pb-8">
              <span
                className={`inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full mb-3 ${
                  post.category === "tuto" ? "bg-brand-orange text-white" : "bg-white/90 text-brand-navy"
                }`}
              >
                {post.category === "tuto" ? <GraduationCap className="h-3.5 w-3.5" /> : <Newspaper className="h-3.5 w-3.5" />}
                {post.category === "tuto" ? (language === "en" ? "Tutorial" : "Tutoriel") : language === "en" ? "News" : "Actualité"}
              </span>
              <h1 className="text-2xl md:text-4xl font-bold text-white leading-tight">{post.title}</h1>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 py-10">
        <a
          href="/infos"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-muted hover:text-brand-navy mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("infos.back")}
        </a>

        {!post.coverImage && (
          <h1 className="text-3xl md:text-4xl font-bold text-brand-navy leading-tight mb-4">{post.title}</h1>
        )}

        <div className="flex items-center gap-3 text-sm text-brand-muted pb-6 mb-8 border-b border-gray-100">
          <CalendarDays className="h-4 w-4" />
          {new Date(post.createdAt).toLocaleDateString(language === "en" ? "en-GB" : "fr-FR")}
          <span className="font-semibold text-brand-navy/70">· {post.authorName}</span>
        </div>

        <PostBlocks blocks={post.content} />

        {/* Footer CTA */}
        <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-brand-navy to-[#3550a5] text-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-bold text-lg">{post.category === "tuto" ? (language === "en" ? "Need more help?" : "Besoin de plus d'aide ?") : (language === "en" ? "Ready to switch to fiber?" : "Prêt à passer à la fibre ?")}</p>
            <p className="text-white/75 text-sm">{language === "en" ? "Our team answers at 4757, 7 days a week." : "Notre équipe répond au 4757, 7j/7."}</p>
          </div>
          <a href="/packages" className="btn-brand whitespace-nowrap">
            {language === "en" ? "View plans" : "Voir les forfaits"}
          </a>
        </div>
      </div>
    </article>
  );
}
