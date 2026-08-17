"use client";

import { useRouter } from "@/lib/router";
import { FAQ_ITEMS, FAQ_ITEMS_EN } from "@/lib/content";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function FAQ() {
  const { language, t } = useRouter();
  const items = language === "en" ? FAQ_ITEMS_EN : FAQ_ITEMS;

  return (
    <section className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-brand-orange/10 text-brand-orange px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide mb-3">
            {t("home.faqBadge")}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-brand-navy mb-2">
            {t("home.faqTitle")}
          </h2>
          <p className="text-brand-muted">{t("home.faqSub")}</p>
        </div>

        <Accordion type="single" collapsible className="space-y-3">
          {items.map((item, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="border border-gray-200 rounded-lg px-4 data-[state=open]:border-brand-orange data-[state=open]:shadow-md"
            >
              <AccordionTrigger className="text-left font-semibold text-brand-navy hover:no-underline py-4">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-brand-muted leading-relaxed pb-4">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
