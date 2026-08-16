"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { FAQ_ITEMS } from "@/lib/content";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function FAQ() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-brand-orange/10 text-brand-orange px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide mb-3">
            FAQ
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-brand-navy mb-2">
            Questions fréquentes
          </h2>
          <p className="text-brand-muted">
            Tout ce que vous devez savoir sur la fibre Liquid Home
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-3">
          {FAQ_ITEMS.map((item, i) => (
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
