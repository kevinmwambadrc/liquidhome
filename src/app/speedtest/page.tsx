import { SpeedTestPage } from "@/components/pages/SpeedTestPage";

export const metadata = {
  title: "Speed Test — Test de Débit Fibre Optique | Liquid Home RDC",
  description:
    "Testez la vitesse réelle de votre connexion Internet en direct. Mesurez le débit en téléchargement (download), envoi (upload), la latence (ping) et la gigue sur le réseau fibre Liquid Home RDC.",
};

export default function Page() {
  return <SpeedTestPage />;
}
