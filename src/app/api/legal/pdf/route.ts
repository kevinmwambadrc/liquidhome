import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { PDFDocument, StandardFonts, rgb, type PDFImage } from "pdf-lib";
import { LEGAL_CONTENT } from "@/lib/legal";

const NAVY = rgb(0.153, 0.235, 0.533); // #273C88
const ORANGE = rgb(0.973, 0.62, 0.235); // #F89E3C
const MUTED = rgb(0.4, 0.4, 0.4);
const BLACK = rgb(0.15, 0.15, 0.15);

const PAGE_W = 595.28; // A4
const PAGE_H = 841.89;
const MARGIN = 56;

function wrap(text: string, font: { widthOfTextAtSize: (t: string, s: number) => number }, size: number, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const candidate = line ? `${line} ${w}` : w;
    if (font.widthOfTextAtSize(candidate, size) > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

// Sanitize to WinAnsi-safe characters (pdf-lib standard fonts limitation)
function winAnsi(s: string): string {
  return s
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u2026/g, "...")
    .replace(/[^\x00-\xFF]/g, "");
}

export async function GET(req: NextRequest) {
  const doc = req.nextUrl.searchParams.get("doc") ?? "privacy";
  const content = LEGAL_CONTENT[doc];
  if (!content || (doc !== "privacy" && doc !== "terms")) {
    return NextResponse.json({ ok: false, message: "Document non téléchargeable." }, { status: 404 });
  }

  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const italic = await pdf.embedFont(StandardFonts.HelveticaOblique);

  // Colored Liquid Home logo
  let logo: PDFImage | null = null;
  try {
    const logoBytes = await readFile(path.join(process.cwd(), "public", "img", "colour_liquid_home2.png"));
    logo = await pdf.embedPng(logoBytes);
  } catch {
    // logo optional — header text still renders
  }

  let page = pdf.addPage([PAGE_W, PAGE_H]);
  let y = PAGE_H - MARGIN;

  const newPageIfNeeded = (needed: number) => {
    if (y - needed < MARGIN + 60) {
      page = pdf.addPage([PAGE_W, PAGE_H]);
      y = PAGE_H - MARGIN;
    }
  };

  // ===== Header band with colored logo =====
  page.drawRectangle({ x: 0, y: PAGE_H - 110, width: PAGE_W, height: 110, color: NAVY });
  page.drawRectangle({ x: 0, y: PAGE_H - 114, width: PAGE_W, height: 4, color: ORANGE });
  if (logo) {
    const maxW = 220;
    const scale = Math.min(maxW / logo.width, 52 / logo.height);
    page.drawImage(logo, {
      x: MARGIN,
      y: PAGE_H - 88,
      width: logo.width * scale,
      height: logo.height * scale,
    });
  }
  page.drawText("Liquid Home RDC", {
    x: PAGE_W - MARGIN - bold.widthOfTextAtSize("Liquid Home RDC", 12),
    y: PAGE_H - 40,
    size: 12,
    font: bold,
    color: rgb(1, 1, 1),
  });
  page.drawText("Kinshasa · Service client 4757 · DRCfibre@liquid.tech", {
    x: PAGE_W - MARGIN - regular.widthOfTextAtSize("Kinshasa · Service client 4757 · DRCfibre@liquid.tech", 8),
    y: PAGE_H - 54,
    size: 8,
    font: regular,
    color: rgb(0.85, 0.87, 0.95),
  });
  y = PAGE_H - 150;

  // ===== Title =====
  const title = winAnsi(content.title);
  page.drawText(title, { x: MARGIN, y, size: 20, font: bold, color: NAVY });
  y -= 14;
  page.drawRectangle({ x: MARGIN, y, width: 60, height: 3, color: ORANGE });
  y -= 22;
  page.drawText("Derniere mise a jour : Janvier 2026", { x: MARGIN, y, size: 9, font: italic, color: MUTED });
  y -= 24;

  // ===== Sections =====
  for (const section of content.sections) {
    newPageIfNeeded(60);
    page.drawText(winAnsi(section.heading), { x: MARGIN, y, size: 13, font: bold, color: NAVY });
    y -= 8;
    for (const line of wrap(winAnsi(section.body), regular, 10.5, PAGE_W - 2 * MARGIN)) {
      newPageIfNeeded(18);
      page.drawText(line, { x: MARGIN, y, size: 10.5, font: regular, color: BLACK });
      y -= 15;
    }
    y -= 12;
  }

  // ===== Footer on every page =====
  const pages = pdf.getPages();
  pages.forEach((p, i) => {
    p.drawLine({
      start: { x: MARGIN, y: 44 },
      end: { x: PAGE_W - MARGIN, y: 44 },
      thickness: 0.5,
      color: rgb(0.85, 0.85, 0.85),
    });
    p.drawText("Liquid Home RDC - document genere depuis cd.liquidhome.tech", {
      x: MARGIN,
      y: 32,
      size: 7.5,
      font: regular,
      color: MUTED,
    });
    const pageLabel = `${i + 1}/${pages.length}`;
    p.drawText(pageLabel, {
      x: PAGE_W - MARGIN - regular.widthOfTextAtSize(pageLabel, 7.5),
      y: 32,
      size: 7.5,
      font: regular,
      color: MUTED,
    });
  });

  const bytes = await pdf.save();
  const filename = doc === "privacy" ? "politique-confidentialite" : "conditions-generales";
  return new NextResponse(bytes as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="liquidhome-${filename}.pdf"`,
    },
  });
}
