"use client";

import Image from "next/image";
import { useRouter } from "@/lib/router";
import { motion } from "framer-motion";
import {
  Youtube,
  MousePointerClick,
  ArrowRight,
} from "lucide-react";

export interface PostBlock {
  type: string;
  text?: string;
  url?: string;
  alt?: string;
  label?: string;
  title?: string;
  align?: "left" | "center" | "right";
  variant?: "orange" | "navy" | "outline";
}

const ALIGN_CLS: Record<string, string> = {
  left: "text-left items-start",
  center: "text-center items-center",
  right: "text-right items-end",
};

const WRAPPER_CLS: Record<string, string> = {
  left: "",
  center: "flex flex-col items-center",
  right: "flex flex-col items-end",
};

function btnCls(variant: string | undefined): string {
  switch (variant) {
    case "navy":
      return "btn-navy btn-brand-lg";
    case "outline":
      return "inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg border-2 border-brand-navy text-brand-navy font-semibold uppercase text-sm tracking-wide hover:bg-brand-navy hover:text-white transition-colors";
    default:
      return "btn-brand btn-brand-lg";
  }
}

const isExternal = (url: string) => url.startsWith("http");

/** Renders blog blocks — shared by the public article page and the admin live preview. */
export function PostBlocks({ blocks, preview = false }: { blocks: PostBlock[]; preview?: boolean }) {
  const { navigate } = useRouter();
  const MotionDiv = preview ? motion.div : motion.div;

  return (
    <div className="space-y-6">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "heading":
            return (
              <h2
                key={i}
                className={`text-xl md:text-2xl font-bold text-brand-navy pt-2 ${ALIGN_CLS[block.align ?? "left"]}`}
              >
                {block.text}
              </h2>
            );
          case "paragraph":
            return (
              <p
                key={i}
                className={`text-brand-muted leading-relaxed text-[15px] md:text-base ${ALIGN_CLS[block.align ?? "left"]}`}
              >
                {block.text}
              </p>
            );
          case "quote":
            return (
              <blockquote
                key={i}
                className={`border-l-4 border-brand-orange bg-brand-soft/60 rounded-r-xl px-5 py-4 text-brand-navy italic ${WRAPPER_CLS[block.align ?? "left"]}`}
              >
                {block.text}
              </blockquote>
            );
          case "image":
            return block.url ? (
              <div key={`w-${i}`} className={WRAPPER_CLS[block.align ?? "left"]}>
                <MotionDiv
                  initial={preview ? false : { opacity: 0, y: 16 }}
                  whileInView={preview ? undefined : { opacity: 1, y: 0 }}
                  animate={preview ? { opacity: 1, y: 0 } : undefined}
                  viewport={{ once: true }}
                  className="relative h-64 md:h-96 w-full rounded-2xl overflow-hidden bg-brand-soft"
                >
                  <Image src={block.url} alt={block.alt ?? ""} fill className="object-cover" sizes="(max-width: 768px) 100vw, 768px" unoptimized={block.url.startsWith("/uploads")} />
                </MotionDiv>
                {block.alt && block.align === "center" && (
                  <p className="text-xs text-brand-muted mt-2">{block.alt}</p>
                )}
              </div>
            ) : null;
          case "youtube":
            return block.url ? (
              <figure key={i} className="rounded-2xl overflow-hidden border border-gray-100">
                <div className="relative pt-[56.25%] bg-brand-navy">
                  <iframe
                    src={block.url}
                    title={block.title ?? "YouTube video"}
                    className="absolute inset-0 h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                {block.title && (
                  <figcaption className="flex items-center gap-2 px-4 py-2.5 text-xs text-brand-muted bg-brand-soft/50">
                    <Youtube className="h-3.5 w-3.5 text-brand-orange" />
                    {block.title}
                  </figcaption>
                )}
              </figure>
            ) : null;
          case "audio":
            return block.url ? (
              <figure key={`wa-${i}`} className={WRAPPER_CLS[block.align ?? "left"]}>
                <div className="w-full rounded-2xl border border-gray-100 p-4 bg-brand-soft/40">
                  <audio controls className="w-full">
                    <source src={block.url} />
                  </audio>
                </div>
              </figure>
            ) : null;
          case "button":
            return block.url && block.label ? (
              <div key={`wb-${i}`} className={WRAPPER_CLS[block.align ?? "left"]}>
                {isExternal(block.url) ? (
                  <a href={block.url} target="_blank" rel="noopener noreferrer" className={btnCls(block.variant)}>
                    <MousePointerClick className="h-4 w-4" />
                    {block.label}
                    <ArrowRight className="h-4 w-4" />
                  </a>
                ) : (
                  <button onClick={() => navigate(block.url!)} className={btnCls(block.variant)}>
                    <MousePointerClick className="h-4 w-4" />
                    {block.label}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            ) : null;
          default:
            return null;
        }
      })}
    </div>
  );
}
