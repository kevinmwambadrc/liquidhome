import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Fast Internet Connectivity | Home | Liquid Home",
  description:
    "Liquid Home RDC - Leader de la fibre optique en République Démocratique du Congo. Connexion internet ultra-rapide, illimitée et abordable pour votre domicile et entreprise à Kinshasa.",
  keywords: [
    "Liquid Home",
    "fibre optique",
    "internet RDC",
    "internet Kinshasa",
    "Libota",
    "FTTH",
    "ISP Congo",
    "broadband DRC",
  ],
  authors: [{ name: "Liquid Intelligent Technologies" }],
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/img/favicons/16.png", sizes: "16x16", type: "image/png" },
    ],
  },
  openGraph: {
    title: "Liquid Home RDC - Leader de la Fibre optique",
    description:
      "Passez en mode Fibre & faites vivre votre maison ! Meilleure connexion, meilleure sensation ! #NETtement Mieux",
    url: "https://cd.liquidhome.tech",
    siteName: "Liquid Home RDC",
    type: "website",
    locale: "fr_CD",
  },
  twitter: {
    card: "summary_large_image",
    title: "Liquid Home RDC - Leader de la Fibre optique",
    description:
      "Passez en mode Fibre & faites vivre votre maison ! #NETtement Mieux",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${montserrat.variable} antialiased bg-background text-foreground font-sans`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
