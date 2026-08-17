import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center bg-white">
      <p className="text-8xl font-extrabold text-brand-navy">4<span className="text-brand-orange">0</span>4</p>
      <h1 className="text-2xl font-bold text-brand-navy mt-4">Page introuvable</h1>
      <p className="text-brand-muted mt-2 max-w-md">
        La page que vous cherchez n&apos;existe pas ou a été déplacée. Vérifiez l&apos;adresse ou revenez à l&apos;accueil.
      </p>
      <div className="flex flex-wrap gap-3 justify-center mt-8">
        <Link href="/" className="btn-brand">Retour à l&apos;accueil</Link>
        <Link href="/packages" className="px-6 py-3 rounded-lg border-2 border-brand-navy text-brand-navy font-semibold hover:bg-brand-navy hover:text-white transition-colors">
          Voir les forfaits
        </Link>
      </div>
    </div>
  );
}
