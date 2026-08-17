// Lucide icons are React values: kept out of the shared server-safe legal lib.
import { ShieldCheck, Cookie, FileText, BookOpen } from "lucide-react";

export const LEGAL_ICONS: Record<string, typeof ShieldCheck> = {
  privacy: ShieldCheck,
  cookies: Cookie,
  usage: FileText,
  terms: BookOpen,
};
