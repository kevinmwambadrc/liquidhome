"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "@/lib/router";
import { initiateMaishaPayCheckout } from "@/lib/maishapay-client";
import { PACKAGES, CONTACT_INFO } from "@/lib/content";
import { PageBanner } from "@/components/sections/PageBanner";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  LogIn,
  ArrowRight,
  Gauge,
  FileText,
  Headphones,
  CreditCard,
  LogOut,
  Package,
  Wifi,
  CheckCircle2,
  Clock,
  XCircle,
  Send,
  Receipt,
  LifeBuoy,
  Settings2,
  CalendarDays,
  TrendingUp,
  AlertCircle,
  BadgeCheck,
  ShieldCheck,
  Wallet,
  ShoppingCart,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { AnimatePresence, motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

/* ============ Types ============ */

interface MeUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  phone: string | null;
  customerNo: string | null;
  mustResetPassword?: boolean;
  kycStatus?: string | null;
  createdAt: string;
}

interface MyOrder {
  id: string;
  ref: string;
  packageId: string;
  packagePrice: number;
  streetAddress: string;
  houseNo: string;
  commune: string | null;
  installationDate: string | null;
  status: string;
  createdAt: string;
}

interface MyInvoice {
  id: string;
  number: string;
  amount: number;
  status: string;
  method: string | null;
  period: string;
  issuedAt: string;
  dueAt: string | null;
}

interface MyTicket {
  id: string;
  ref: string;
  subject: string;
  message: string;
  status: string;
  priority?: string;
  adminReply?: string | null;
  repliedAt?: string | null;
  createdAt: string;
}

interface MyEquipmentOrder {
  id: string;
  ref: string;
  items: { slug: string; name: string; unitPrice: number; qty: number }[];
  total: number;
  status: string;
  createdAt: string;
}

const STATUS_META: Record<string, { label: string; cls: string; icon: typeof Clock }> = {
  pending: { label: "En attente", cls: "bg-amber-100 text-amber-800", icon: Clock },
  approved: { label: "Install. planifiée", cls: "bg-blue-100 text-blue-800", icon: CalendarDays },
  installed: { label: "Actif", cls: "bg-green-100 text-green-800", icon: CheckCircle2 },
  cancelled: { label: "Annulée", cls: "bg-red-100 text-red-700", icon: XCircle },
  paid: { label: "Payée", cls: "bg-green-100 text-green-800", icon: CheckCircle2 },
  unpaid: { label: "À payer", cls: "bg-orange-100 text-orange-800", icon: AlertCircle },
  open: { label: "Ouvert", cls: "bg-blue-100 text-blue-800", icon: LifeBuoy },
  "in-progress": { label: "En cours", cls: "bg-amber-100 text-amber-800", icon: Clock },
  resolved: { label: "Résolu", cls: "bg-green-100 text-green-800", icon: CheckCircle2 },
};

function StatusChip({ status }: { status: string }) {
  const meta = STATUS_META[status] ?? { label: status, cls: "bg-gray-100 text-gray-700", icon: Clock };
  const Icon = meta.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${meta.cls}`}>
      <Icon className="h-3.5 w-3.5" />
      {meta.label}
    </span>
  );
}

function pkgName(id: string) {
  return PACKAGES.find((p) => p.id === id)?.name ?? id;
}

/** Deterministic pseudo-usage per user so the chart is stable across reloads. */
function usageSeries(seed: string) {
  const h = [...seed].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 997, 7);
  return Array.from({ length: 14 }, (_, i) => {
    const day = new Date();
    day.setDate(day.getDate() - (13 - i));
    const base = 18 + (h % 9);
    const noise = ((h * (i + 3)) % 17) - 6;
    const weekend = [0, 6].includes(day.getDay()) ? 9 : 0;
    return {
      day: day.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }),
      gb: Math.max(4, Math.round(base + noise + weekend + Math.sin(i / 2) * 5)),
    };
  });
}

/* ============ Page ============ */

export function MyLiquidPage() {
  const { navigate } = useRouter();
  const [me, setMe] = useState<MeUser | null>(null);
  const [mustReset, setMustReset] = useState(false);
  const [orders, setOrders] = useState<MyOrder[]>([]);
  const [invoices, setInvoices] = useState<MyInvoice[]>([]);
  const [tickets, setTickets] = useState<MyTicket[]>([]);
  const [equipmentOrders, setEquipmentOrders] = useState<MyEquipmentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      const data = await res.json();
      if (data.user) {
        setMe(data.user);
        setMustReset(!!data.user.mustResetPassword);
        setOrders(data.orders ?? []);
        setInvoices(data.invoices ?? []);
        setTickets(data.tickets ?? []);
        if (data.user.role !== "admin") {
          fetch("/api/equipment-orders", { cache: "no-store" })
            .then((r) => r.json())
            .then((d) => setEquipmentOrders(d.orders ?? []))
            .catch(() => {});
        }
      } else {
        setMe(null);
        setMustReset(false);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(() => {
      fetch("/api/auth/me", { cache: "no-store" })
        .then((r) => r.json())
        .then((data) => {
          if (data.user) {
            setOrders(data.orders ?? []);
            setInvoices(data.invoices ?? []);
            setTickets(data.tickets ?? []);
          }
        })
        .catch(() => {});
    }, 4000);
    return () => clearInterval(interval);
  }, [refresh]);

  const onLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setMe(null);
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-orange" />
      </div>
    );
  }

  if (!me) {
    return <LoginView onLoggedIn={refresh} />;
  }

  if (me.role === "admin") {
    return <AdminRedirect onLogout={onLogout} />;
  }

  if (me.mustResetPassword || mustReset) {
    return <ForceResetView email={me.email} onDone={refresh} />;
  }

  return (
    <ClientDashboard
      me={me}
      orders={orders}
      invoices={invoices}
      tickets={tickets}
      equipmentOrders={equipmentOrders}
      onLogout={onLogout}
      onChanged={refresh}
    />
  );
}

/* ============ Login ============ */

function LoginView({ onLoggedIn }: { onLoggedIn: (mustReset?: boolean) => void }) {
  const { navigate, t } = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.message || "Connexion impossible.");
      } else {
        window.dispatchEvent(new CustomEvent("lh:auth"));
        onLoggedIn(!!data.mustResetPassword);
      }
    } catch {
      setError("Erreur réseau. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageBanner title={t("myliquid.title")} subtitle={t("myliquid.subtitle")} />

      <section className="py-14 bg-gradient-to-b from-brand-soft to-white">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-md w-full mx-auto"
          >
            <div className="bg-white/90 backdrop-blur rounded-2xl border border-gray-100 shadow-xl shadow-brand-navy/10 p-8">
              <div className="flex justify-center mb-4">
                <Image
                  src="/img/colour_liquid_home2.png"
                  alt="MyLiquid"
                  width={216}
                  height={66}
                  className="h-11 w-auto"
                />
              </div>
              <h2 className="text-xl font-bold text-brand-navy text-center mb-1">{t("myliquid.login")}</h2>
              <p className="text-sm text-brand-muted text-center mb-6">{t("myliquid.loginSub")}</p>

              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-brand-navy mb-2">{t("myliquid.emailOrId")}</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-muted" />
                    <input
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="client@liquid.tech"
                      className="input-brand pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-brand-navy mb-2">Mot de passe</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-muted" />
                    <input
                      type={showPwd ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="input-brand pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-navy"
                      aria-label={showPwd ? "Masquer" : "Afficher"}
                    >
                      {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-700">
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 text-brand-muted cursor-pointer">
                    <input type="checkbox" className="rounded border-gray-300 accent-brand-orange" />
                    {t("myliquid.remember")}
                  </label>
                  <button type="button" className="text-brand-orange hover:underline">
                    {t("myliquid.forgot")}
                  </button>
                </div>

                <button type="submit" disabled={loading} className="btn-brand btn-brand-block btn-brand-lg">
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t("myliquid.loggingIn")}
                    </>
                  ) : (
                    <>
                      <LogIn className="h-4 w-4" />
                      {t("myliquid.login")}
                    </>
                  )}
                </button>
              </form>

              <div className="mt-4 rounded-lg bg-brand-soft/70 border border-gray-200 px-3 py-2 text-xs text-brand-muted text-center">
                {t("myliquid.demoHint")} : <span className="font-semibold text-brand-navy">jean@demo.cd</span> /{" "}
                <span className="font-semibold text-brand-navy">Client1234</span>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100 text-center text-sm">
                <p className="text-brand-muted mb-2">{t("myliquid.noAccount")}</p>
                <button
                  onClick={() => navigate("/souscrire")}
                  className="inline-flex items-center gap-1 text-brand-orange font-semibold hover:underline"
                >
                  {t("myliquid.subscribeLink")} <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>

          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-brand-navy mb-4">Tout votre abonnement au bout des doigts</h3>
            {[
              { icon: Gauge, title: "Suivi de consommation", desc: "Visualisez votre consommation de données en temps réel, par jour, semaine ou mois." },
              { icon: FileText, title: "Factures & paiements", desc: "Consultez et téléchargez vos factures, payez en ligne par Mobile Money ou carte." },
              { icon: Headphones, title: "Support technique", desc: "Ouvrez des tickets et suivez leur résolution, chattez avec nos techniciens." },
              { icon: CreditCard, title: "Gestion du forfait", desc: "Changez de forfait, ajoutez des options, mettez à jour vos coordonnées." },
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.1, duration: 0.5 }}
                  className="flex gap-4 p-4 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
                >
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-brand-orange to-brand-orange-hover flex items-center justify-center flex-shrink-0 shadow-md shadow-brand-orange/30">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-brand-navy">{f.title}</h4>
                    <p className="text-sm text-brand-muted">{f.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}

function ForceResetView({ email, onDone }: { email: string; onDone: () => void }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (next !== confirmPwd) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current_password: current, new_password: next }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.message || "Réinitialisation impossible.");
      } else {
        onDone();
      }
    } catch {
      setError("Erreur réseau.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="py-14 bg-gradient-to-b from-brand-soft to-white">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md mx-auto px-4"
      >
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xl shadow-brand-navy/10 p-8">
          <div className="flex justify-center mb-4">
            <Image src="/img/colour_liquid_home2.png" alt="MyLiquid" width={216} height={66} className="h-11 w-auto" />
          </div>
          <h2 className="text-xl font-bold text-brand-navy text-center mb-1">Mot de passe provisoire</h2>
          <p className="text-sm text-brand-muted text-center mb-6">
            Pour sécuriser votre compte <span className="font-semibold text-brand-navy">{email}</span>, choisissez
            votre propre mot de passe (8 caractères min., lettres et chiffres).
          </p>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-brand-navy mb-2">Mot de passe provisoire (reçu par email)</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-muted" />
                <input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} required className="input-brand pl-10" placeholder="••••••••" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-navy mb-2">Nouveau mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-muted" />
                <input type="password" value={next} onChange={(e) => setNext(e.target.value)} required minLength={8} className="input-brand pl-10" placeholder="••••••••" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-navy mb-2">Confirmer le nouveau mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-muted" />
                <input type="password" value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} required minLength={8} className="input-brand pl-10" placeholder="••••••••" />
              </div>
            </div>
            {error && (
              <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                {error}
              </div>
            )}
            <button type="submit" disabled={saving} className="btn-brand btn-brand-block btn-brand-lg">
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Réinitialisation...
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  Définir mon mot de passe
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </section>
  );
}

function AdminRedirect({ onLogout }: { onLogout: () => void }) {
  const { navigate } = useRouter();
  return (
    <section className="py-24 bg-brand-soft">
      <div className="max-w-md mx-auto px-4 text-center">
        <BadgeCheck className="h-14 w-14 text-brand-navy mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-brand-navy mb-2">Vous êtes connecté en administrateur</h2>
        <p className="text-brand-muted mb-6">Accédez au back-office pour piloter l&apos;activité.</p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => navigate("/admin")} className="btn-brand">
            Tableau de bord admin
          </button>
          <button onClick={onLogout} className="px-6 py-3 rounded-lg border-2 border-brand-navy text-brand-navy font-semibold hover:bg-brand-navy hover:text-white transition-colors">
            Déconnexion
          </button>
        </div>
      </div>
    </section>
  );
}

/* ============ Client dashboard ============ */

const TABS = [
  { id: "overview", label: "Aperçu", icon: Gauge },
  { id: "orders", label: "Mes commandes", icon: Package },
  { id: "purchases", label: "Mes achats", icon: ShoppingCart },
  { id: "invoices", label: "Factures", icon: Receipt },
  { id: "support", label: "Support", icon: LifeBuoy },
  { id: "profile", label: "Profil", icon: Settings2 },
] as const;

type TabId = (typeof TABS)[number]["id"];

function ClientDashboard({
  me,
  orders,
  invoices,
  tickets,
  equipmentOrders,
  onLogout,
  onChanged,
}: {
  me: MeUser;
  orders: MyOrder[];
  invoices: MyInvoice[];
  tickets: MyTicket[];
  equipmentOrders: MyEquipmentOrder[];
  onLogout: () => void;
  onChanged: () => void;
}) {
  const [tab, setTab] = useState<TabId>("overview");
  const [topupOpen, setTopupOpen] = useState(false);
  const [paymentNotice, setPaymentNotice] = useState<{ ok: boolean; msg: string } | null>(null);
  const activeOrder = orders.find((o) => o.status === "installed") ?? orders[0];
  const nextInvoice = invoices.find((i) => i.status === "unpaid");
  const usage = useMemo(() => usageSeries(me.id), [me.id]);
  const totalGb = usage.reduce((s, d) => s + d.gb, 0);

  useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      const paymentStatus = sp.get("payment");
      if (paymentStatus === "success") {
        const ref = sp.get("ref") || "";
        queueMicrotask(() => {
          setPaymentNotice({
            ok: true,
            msg: `Paiement validé avec succès via MaishaPay ! ${ref ? `(Réf: ${ref})` : ""} Votre compte et vos services ont été mis à jour.`,
          });
        });
        window.history.replaceState({}, "", "/myliquid");
        onChanged();
      } else if (paymentStatus === "failed") {
        const desc = sp.get("desc") || "La transaction n'a pas pu être finalisée.";
        queueMicrotask(() => {
          setPaymentNotice({
            ok: false,
            msg: `Paiement MaishaPay non complété : ${desc}`,
          });
        });
        window.history.replaceState({}, "", "/myliquid");
      }
    } catch {}
  }, [onChanged]);

  return (
    <div className="bg-brand-soft/60 min-h-screen">
      {/* Dashboard header */}
      <div className="bg-brand-header-gradient text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 [background:radial-gradient(circle_at_80%_20%,#fff_0,transparent_40%)]" />
        <div className="max-w-7xl mx-auto px-4 py-10 relative">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-white/15 backdrop-blur border border-white/25 flex items-center justify-center text-xl font-bold">
                {(me.name ?? me.email).slice(0, 1).toUpperCase()}
              </div>
              <div>
                <p className="text-white/70 text-sm">Bonjour 👋</p>
                <h1 className="text-2xl font-bold">{me.name ?? me.email}</h1>
                <p className="text-white/70 text-xs mt-0.5">
                  Client n° {me.customerNo ?? "—"} · {me.email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTopupOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-orange hover:bg-brand-orange-hover text-sm font-semibold transition-colors shadow-md shadow-brand-orange/40"
              >
                <Wallet className="h-4 w-4" />
                Réabonnement
              </button>
              <button
                onClick={onLogout}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-sm font-semibold transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {paymentNotice && (
          <div
            className={`mb-6 p-4 rounded-xl border flex items-center justify-between gap-3 shadow-sm ${
              paymentNotice.ok
                ? "bg-green-50 border-green-200 text-green-900"
                : "bg-red-50 border-red-200 text-red-900"
            }`}
          >
            <div className="flex items-center gap-3">
              {paymentNotice.ok ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
              )}
              <span className="text-sm font-medium">{paymentNotice.msg}</span>
            </div>
            <button
              onClick={() => setPaymentNotice(null)}
              className="text-xs opacity-70 hover:opacity-100 font-bold px-2 py-1"
            >
              ✕
            </button>
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
          {/* Sidebar */}
          <nav className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 h-fit lg:sticky lg:top-28">
            <div className="flex lg:flex-col gap-1 overflow-x-auto">
              {TABS.map((t) => {
                const Icon = t.icon;
                const active = tab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                      active
                        ? "bg-brand-navy text-white shadow-md shadow-brand-navy/25"
                        : "text-brand-muted hover:bg-brand-soft hover:text-brand-navy"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Content */}
          <div className="min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                {tab === "overview" && (
                  <OverviewTab
                    me={me}
                    orders={orders}
                    activeOrder={activeOrder}
                    nextInvoice={nextInvoice}
                    usage={usage}
                    totalGb={totalGb}
                    tickets={tickets}
                  />
                )}
                {tab === "orders" && <OrdersTab orders={orders} />}
                {tab === "purchases" && <PurchasesTab orders={equipmentOrders} />}
                {tab === "invoices" && <InvoicesTab invoices={invoices} onChanged={onChanged} />}
                {tab === "support" && <SupportTab tickets={tickets} onChanged={onChanged} />}
                {tab === "profile" && <ProfileTab me={me} onChanged={onChanged} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <TopupModal open={topupOpen} onOpenChange={setTopupOpen} onChanged={onChanged} />
    </div>
  );
}

/* ============ Topup (réabonnement) ============ */

function TopupModal({ open, onOpenChange, onChanged }: { open: boolean; onOpenChange: (v: boolean) => void; onChanged: () => void }) {
  const [packages, setPackages] = useState<{ slug: string; name: string; price: number; speed: string }[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [done, setDone] = useState<null | { ok: boolean; msg: string }>(null);

  useEffect(() => {
    if (!open) return;
    const raf = requestAnimationFrame(() => setDone(null));
    fetch("/api/packages", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        setPackages(d.packages ?? []);
        setSelected((prev) => prev ?? d.packages?.[0]?.slug ?? null);
      })
      .catch(() => {});
    return () => cancelAnimationFrame(raf);
  }, [open]);

  const pay = async () => {
    if (!selected) return;
    setPaying(true);
    setDone(null);
    try {
      const result = await initiateMaishaPayCheckout({
        type: "topup",
        package_slug: selected,
      });
      if (!result.ok) {
        setDone({ ok: false, msg: result.message || "Erreur lors de l'initialisation du paiement." });
        setPaying(false);
      }
    } catch {
      setDone({ ok: false, msg: "Erreur réseau." });
      setPaying(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-white max-h-[90vh] overflow-y-auto">
        <DialogTitle className="sr-only">Réabonnement</DialogTitle>
        <DialogDescription className="sr-only">Renouveler votre abonnement Libota</DialogDescription>
        <div className="bg-brand-header-gradient px-6 pt-6 pb-7 text-center">
          <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-white/15 border border-white/25 flex items-center justify-center">
            <Wallet className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white">Réabonnement</h2>
          <p className="text-white/85 text-sm mt-1">Renouvelez votre ligne fibre — paiement MaishaPay instantané</p>
        </div>

        {done ? (
          <div className="p-6 text-center">
            <div className={`mx-auto mb-3 h-14 w-14 rounded-full flex items-center justify-center ${done.ok ? "bg-green-100" : "bg-red-100"}`}>
              {done.ok ? <CheckCircle2 className="h-8 w-8 text-green-600" /> : <AlertCircle className="h-8 w-8 text-red-500" />}
            </div>
            <p className="text-sm text-brand-muted mb-5">{done.msg}</p>
            <button onClick={() => onOpenChange(false)} className="btn-brand">OK</button>
          </div>
        ) : (
          <div className="p-6 space-y-3">
            {packages.map((p) => (
              <button
                key={p.slug}
                onClick={() => setSelected(p.slug)}
                className={`w-full flex items-center justify-between gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                  selected === p.slug ? "border-brand-orange bg-orange-50/60 shadow-md" : "border-gray-100 hover:border-brand-orange/40"
                }`}
              >
                <div>
                  <p className="font-bold text-brand-navy">{p.name}</p>
                  <p className="text-xs text-brand-muted">{p.speed}</p>
                </div>
                <span className="font-extrabold text-brand-orange">{p.price} USD</span>
              </button>
            ))}
            <button onClick={pay} disabled={!selected || paying} className="btn-brand btn-brand-block btn-brand-lg">
              {paying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Redirection MaishaPay...
                </>
              ) : (
                <>
                  <Wallet className="h-4 w-4" />
                  Payer via MaishaPay (Mobile Money / Carte)
                </>
              )}
            </button>
            <p className="text-[11px] text-brand-muted text-center">
              Paiement sécurisé MaishaPay (M-Pesa, Orange Money, Airtel Money, Visa, Mastercard). Un reçu est généré automatiquement.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ============ Mes achats (équipements) ============ */

const EQ_STATUS: Record<string, { label: string; cls: string }> = {
  pending: { label: "En attente", cls: "bg-amber-100 text-amber-800" },
  confirmed: { label: "Confirmée", cls: "bg-blue-100 text-blue-800" },
  delivered: { label: "Livrée", cls: "bg-green-100 text-green-800" },
  cancelled: { label: "Annulée", cls: "bg-red-100 text-red-700" },
};

function PurchasesTab({ orders }: { orders: MyEquipmentOrder[] }) {
  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
        <ShoppingCart className="h-12 w-12 text-brand-muted/40 mx-auto mb-3" />
        <p className="text-brand-muted">Aucun achat d&apos;équipement pour le moment.</p>
        <a href="/packages" className="btn-brand mt-4 inline-flex">Découvrir les équipements</a>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {orders.map((o, i) => {
        const meta = EQ_STATUS[o.status] ?? { label: o.status, cls: "bg-gray-100 text-gray-700" };
        return (
          <motion.div
            key={o.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
              <div>
                <p className="text-xs text-brand-muted font-mono">{o.ref} · {new Date(o.createdAt).toLocaleDateString("fr-FR")}</p>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold mt-1.5 ${meta.cls}`}>
                  {meta.label}
                </span>
              </div>
              <span className="font-extrabold text-brand-orange text-lg">{o.total} USD</span>
            </div>
            <ul className="divide-y divide-gray-100">
              {o.items.map((it, j) => (
                <li key={j} className="flex items-center justify-between py-2 text-sm">
                  <span className="text-brand-navy font-medium">{it.name} × {it.qty}</span>
                  <span className="text-brand-muted">{it.unitPrice * it.qty} USD</span>
                </li>
              ))}
            </ul>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ============ Overview ============ */

function OverviewTab({
  me,
  orders,
  activeOrder,
  nextInvoice,
  usage,
  totalGb,
  tickets,
}: {
  me: MeUser;
  orders: MyOrder[];
  activeOrder?: MyOrder;
  nextInvoice?: MyInvoice;
  usage: { day: string; gb: number }[];
  totalGb: number;
  tickets: MyTicket[];
}) {
  const kpis = [
    {
      label: "Statut abonnement",
      icon: Wifi,
      value: activeOrder?.status === "installed" ? "Actif" : activeOrder ? "En cours" : "Aucun",
      sub: activeOrder ? pkgName(activeOrder.packageId) : "Souscrivez un forfait",
      accent: "from-green-500 to-emerald-600",
    },
    {
      label: "Forfait actuel",
      icon: TrendingUp,
      value: activeOrder ? pkgName(activeOrder.packageId) : "—",
      sub: activeOrder ? `${activeOrder.packagePrice} USD / mois` : "",
      accent: "from-brand-orange to-brand-orange-hover",
    },
    {
      label: "Prochaine facture",
      icon: Receipt,
      value: nextInvoice ? `${nextInvoice.amount} USD` : "0 USD",
      sub: nextInvoice?.dueAt
        ? `Échéance ${new Date(nextInvoice.dueAt).toLocaleDateString("fr-FR")}`
        : "Aucune en attente",
      accent: "from-brand-navy to-blue-700",
    },
    {
      label: "Consommation (14 j)",
      icon: Gauge,
      value: `${totalGb} Go`,
      sub: "Données illimitées — Libota",
      accent: "from-violet-500 to-purple-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((k, i) => {
          const Icon = k.icon;
          return (
            <motion.div
              key={k.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.4 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow"
            >
              <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${k.accent} flex items-center justify-center text-white shadow-md mb-3`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-xs text-brand-muted uppercase tracking-wide font-semibold">{k.label}</p>
              <p className="text-xl font-bold text-brand-navy mt-1">{k.value}</p>
              <p className="text-xs text-brand-muted mt-0.5">{k.sub}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-brand-navy">Consommation de données</h3>
              <p className="text-xs text-brand-muted">14 derniers jours · illimité sur Libota</p>
            </div>
            <span className="text-xs font-semibold bg-brand-soft px-3 py-1.5 rounded-full text-brand-navy">
              {totalGb} Go cumulés
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={usage} margin={{ top: 5, right: 5, bottom: 0, left: -18 }}>
                <defs>
                  <linearGradient id="usageGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f89e3c" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#f89e3c" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef0f4" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#666" }} axisLine={false} tickLine={false} interval={2} />
                <YAxis tick={{ fontSize: 11, fill: "#666" }} axisLine={false} tickLine={false} unit=" G" />
                <Tooltip
                  formatter={(v) => [`${v} Go`, "Consommé"]}
                  contentStyle={{ borderRadius: 12, border: "1px solid #eee", boxShadow: "0 8px 24px rgba(39,60,136,.12)" }}
                />
                <Area type="monotone" dataKey="gb" stroke="#f89e3c" strokeWidth={2.5} fill="url(#usageGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div
            className={`rounded-2xl p-5 border-2 ${
              me.kycStatus === "approved"
                ? "bg-green-50 border-green-200"
                : me.kycStatus === "rejected"
                  ? "bg-red-50 border-red-200"
                  : "bg-amber-50 border-amber-200"
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              {me.kycStatus === "approved" ? (
                <BadgeCheck className="h-6 w-6 text-green-600" />
              ) : me.kycStatus === "rejected" ? (
                <XCircle className="h-6 w-6 text-red-500" />
              ) : (
                <Clock className="h-6 w-6 text-amber-500" />
              )}
              <h3 className="font-bold text-brand-navy">Vérification d&apos;identité</h3>
            </div>
            {me.kycStatus === "approved" ? (
              <p className="text-sm text-green-800">Votre identité est <b>vérifiée</b>. Votre ligne est pleinement active.</p>
            ) : me.kycStatus === "rejected" ? (
              <p className="text-sm text-red-800">Votre pièce d&apos;identité a été <b>rejetée</b>. Contactez le 4757 ou soumettez une nouvelle commande avec un document valide.</p>
            ) : (
              <p className="text-sm text-amber-800">
                <b>En attente de vérification.</b> Notre équipe contrôle votre pièce d&apos;identité sous 24h. Le statut passera à « Vérifiée » après validation.
              </p>
            )}
          </div>

          <div className="bg-gradient-to-br from-brand-navy to-[#3550a5] text-white rounded-2xl p-6 shadow-lg shadow-brand-navy/25 relative overflow-hidden">
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
            <Wifi className="h-8 w-8 text-brand-orange mb-3" />
            <h3 className="font-bold text-lg">Votre ligne fibre</h3>
            {activeOrder ? (
              <>
                <p className="text-white/80 text-sm mt-1">
                  {activeOrder.streetAddress}, n° {activeOrder.houseNo}
                  {activeOrder.commune ? ` · ${activeOrder.commune}` : ""}
                </p>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-white/70">Statut</span>
                  <StatusChip status={activeOrder.status} />
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-white/70">Depuis le</span>
                  <span className="font-semibold">
                    {new Date(activeOrder.createdAt).toLocaleDateString("fr-FR")}
                  </span>
                </div>
              </>
            ) : (
              <p className="text-white/80 text-sm mt-1">Aucune ligne active pour le moment.</p>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-brand-navy">Derniers tickets</h3>
              <span className="text-xs text-brand-muted">{tickets.length} au total</span>
            </div>
            {tickets.length === 0 ? (
              <p className="text-sm text-brand-muted">Aucun ticket ouvert. Tout roule ! 🎉</p>
            ) : (
              <ul className="space-y-3">
                {tickets.slice(0, 3).map((t) => (
                  <li key={t.id} className="flex items-start justify-between gap-2 text-sm">
                    <div className="min-w-0">
                      <p className="font-semibold text-brand-navy truncate">{t.subject}</p>
                      <p className="text-xs text-brand-muted">{t.ref}</p>
                    </div>
                    <StatusChip status={t.status} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============ Orders ============ */

const ORDER_STEPS = ["pending", "approved", "installed"];

function OrdersTab({ orders }: { orders: MyOrder[] }) {
  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
        <Package className="h-12 w-12 text-brand-muted/40 mx-auto mb-3" />
        <p className="text-brand-muted">Vous n&apos;avez aucune commande pour le moment.</p>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {orders.map((o, i) => {
        const stepIdx = ORDER_STEPS.indexOf(o.status);
        return (
          <motion.div
            key={o.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
          >
            <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
              <div>
                <p className="text-xs text-brand-muted font-mono">{o.ref}</p>
                <h3 className="text-lg font-bold text-brand-navy">{pkgName(o.packageId)}</h3>
                <p className="text-sm text-brand-muted">
                  {o.streetAddress}, n° {o.houseNo}
                  {o.commune ? ` · ${o.commune}` : ""}
                </p>
              </div>
              <div className="text-right">
                <StatusChip status={o.status} />
                <p className="text-sm font-bold text-brand-orange mt-1.5">{o.packagePrice} USD/mois</p>
              </div>
            </div>

            {o.status !== "cancelled" ? (
              <div className="flex items-center">
                {["Commande reçue", "Installation planifiée", "Ligne active"].map((label, si) => (
                  <div key={label} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center gap-1.5">
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                          si <= stepIdx ? "bg-brand-orange text-white shadow-md shadow-brand-orange/40" : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {si < stepIdx ? <CheckCircle2 className="h-4 w-4" /> : si + 1}
                      </div>
                      <span className={`text-[11px] font-medium ${si <= stepIdx ? "text-brand-navy" : "text-gray-400"}`}>
                        {label}
                      </span>
                    </div>
                    {si < 2 && (
                      <div className={`flex-1 h-0.5 mx-2 -mt-6 rounded-full ${si < stepIdx ? "bg-brand-orange" : "bg-gray-200"}`} />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-red-600">Cette commande a été annulée.</p>
            )}

            {o.installationDate && o.status !== "cancelled" && (
              <p className="mt-4 text-xs text-brand-muted flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" />
                Installation souhaitée le {new Date(o.installationDate).toLocaleDateString("fr-FR")}
              </p>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

/* ============ Invoices ============ */

function InvoicesTab({ invoices, onChanged }: { invoices: MyInvoice[]; onChanged: () => void }) {
  const [paying, setPaying] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");

  const pay = async (id: string) => {
    setPaying(id);
    setFeedback("");
    try {
      const result = await initiateMaishaPayCheckout({
        type: "invoice",
        invoice_id: id,
      });
      if (!result.ok) {
        setFeedback(result.message || "Erreur lors de l'initialisation du paiement.");
        setPaying(null);
      }
    } catch {
      setFeedback("Erreur de connexion avec la passerelle MaishaPay.");
      setPaying(null);
    }
  };

  if (invoices.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
        <Receipt className="h-12 w-12 text-brand-muted/40 mx-auto mb-3" />
        <p className="text-brand-muted">Aucune facture pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {feedback && (
        <div className="flex items-center gap-2 bg-amber-50 border-b border-amber-200 px-5 py-3 text-sm text-amber-900">
          <AlertCircle className="h-4 w-4" />
          {feedback}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-brand-soft/60 text-left text-brand-navy">
              <th className="px-5 py-3.5 font-semibold">Facture</th>
              <th className="px-5 py-3.5 font-semibold">Période</th>
              <th className="px-5 py-3.5 font-semibold">Émission</th>
              <th className="px-5 py-3.5 font-semibold">Montant</th>
              <th className="px-5 py-3.5 font-semibold">Statut</th>
              <th className="px-5 py-3.5 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv, i) => (
              <motion.tr
                key={inv.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="border-t border-gray-100 hover:bg-brand-soft/40 transition-colors"
              >
                <td className="px-5 py-4 font-mono text-xs font-semibold text-brand-navy">{inv.number}</td>
                <td className="px-5 py-4">{inv.period}</td>
                <td className="px-5 py-4 text-brand-muted">
                  {new Date(inv.issuedAt).toLocaleDateString("fr-FR")}
                </td>
                <td className="px-5 py-4 font-bold text-brand-navy">{inv.amount} USD</td>
                <td className="px-5 py-4">
                  <StatusChip status={inv.status} />
                </td>
                <td className="px-5 py-4 text-right">
                  {inv.status === "unpaid" ? (
                    <button
                      onClick={() => pay(inv.id)}
                      disabled={paying === inv.id}
                      className="btn-brand text-xs px-4 py-2"
                      title="Payer via MaishaPay (Mobile Money / Carte)"
                    >
                      {paying === inv.id ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Redirection...
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-3.5 w-3.5" />
                          Payer (MaishaPay)
                        </>
                      )}
                    </button>
                  ) : (
                    <span className="text-xs text-brand-muted font-medium">
                      Payée via {inv.method === "card" ? "carte" : inv.method === "maishapay" ? "MaishaPay" : "Mobile Money"}
                    </span>
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ============ Support ============ */

function SupportTab({ tickets, onChanged }: { tickets: MyTicket[]; onChanged: () => void }) {
  const { navigate } = useRouter();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState("normal");
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setFeedback("");
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, message, priority }),
      });
      const data = await res.json();
      setFeedback(data.message ?? "");
      if (data.ok) {
        setSubject("");
        setMessage("");
        setPriority("normal");
        onChanged();
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-bold text-brand-navy">Ouvrir un ticket support</h3>
          <span className="flex items-center gap-1 text-[11px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Support en direct
          </span>
        </div>
        <p className="text-sm text-brand-muted mb-5">
          Notre équipe technique vous répond dans les plus brefs délais. Pour les urgences, appelez le {CONTACT_INFO.shortPhone}.
        </p>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-brand-navy mb-2">Objet du problème</label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              placeholder="Ex: Connexion fibre instable ou perte de signal"
              className="input-brand"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-navy mb-2">Degré d&apos;urgence</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="input-brand"
            >
              <option value="normal">Normal (Assistance standard sous 24h)</option>
              <option value="high">Haute (Perturbation majeure)</option>
              <option value="urgent">Urgente (Coupure totale fibre)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-navy mb-2">Description détaillée</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={4}
              placeholder="Expliquez ce que vous observez (ex: voyant LOS rouge sur la box, panne depuis ce matin...)"
              className="input-brand resize-y"
            />
          </div>
          <button type="submit" disabled={sending} className="btn-brand btn-brand-block">
            {sending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Envoi en cours...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Envoyer le ticket au support
              </>
            )}
          </button>
          {feedback && (
            <p className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              <CheckCircle2 className="h-4 w-4" />
              {feedback}
            </p>
          )}
        </form>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-brand-navy">Mes tickets ({tickets.length})</h3>
          <span className="text-xs text-brand-muted">Mise à jour en temps réel</span>
        </div>
        {tickets.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center text-sm text-brand-muted">
            Aucun ticket ouvert actuellement. Tout fonctionne ! 🎉 Besoin d&apos;aide ?{" "}
            <button onClick={() => navigate("/contact")} className="text-brand-orange font-semibold hover:underline block mt-2">
              Contactez le support
            </button>
          </div>
        )}
        {tickets.map((t, i) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <p className="font-bold text-brand-navy truncate">{t.subject}</p>
                  {t.priority === "urgent" && (
                    <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold uppercase">
                      Urgent
                    </span>
                  )}
                  {t.priority === "high" && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold uppercase">
                      Prioritaire
                    </span>
                  )}
                </div>
                <p className="text-xs text-brand-muted font-mono">{t.ref} · {new Date(t.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
              </div>
              <StatusChip status={t.status} />
            </div>

            <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-700 leading-relaxed border border-gray-100">
              <span className="font-semibold text-brand-navy block mb-0.5">Votre message :</span>
              {t.message}
            </div>

            {/* Official Support Response */}
            {t.adminReply && (
              <div className="bg-brand-soft/80 border-l-4 border-brand-orange rounded-r-xl p-3.5 text-xs text-brand-navy animate-in fade-in duration-300">
                <div className="flex items-center justify-between mb-1.5 font-bold text-brand-navy flex-wrap gap-1">
                  <span className="flex items-center gap-1.5 text-brand-orange">
                    <Headphones className="h-3.5 w-3.5" />
                    Réponse de l&apos;équipe technique Liquid Home
                  </span>
                  {t.repliedAt && (
                    <span className="text-[10px] text-brand-muted font-normal">
                      {new Date(t.repliedAt).toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  )}
                </div>
                <p className="whitespace-pre-wrap leading-relaxed text-brand-navy font-medium bg-white/60 p-2.5 rounded-lg border border-brand-orange/20">
                  {t.adminReply}
                </p>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ============ Profile ============ */

function ProfileTab({ me, onChanged }: { me: MeUser; onChanged: () => void }) {
  const [name, setName] = useState(me.name ?? "");
  const [phone, setPhone] = useState(me.phone ?? "");
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState("");

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback("");
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });
      const data = await res.json();
      setFeedback(data.message ?? "");
      if (data.ok) onChanged();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 max-w-xl">
      <h3 className="font-bold text-brand-navy mb-5">Mes coordonnées</h3>
      <form onSubmit={save} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-brand-navy mb-2">Nom complet</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-muted" />
            <input value={name} onChange={(e) => setName(e.target.value)} className="input-brand pl-10" placeholder="Votre nom" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-brand-navy mb-2">Téléphone</label>
          <div className="relative">
            <Headphones className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-muted" />
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="input-brand pl-10" placeholder="+243 ..." />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-brand-navy mb-2">Email (non modifiable)</label>
          <input value={me.email} disabled className="input-brand pl-10 bg-gray-50 text-brand-muted" />
        </div>
        <button type="submit" disabled={saving} className="btn-brand">
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Enregistrement...
            </>
          ) : (
            "Enregistrer"
          )}
        </button>
        {feedback && (
          <p className="flex items-center gap-2 text-sm text-green-700">
            <CheckCircle2 className="h-4 w-4" />
            {feedback}
          </p>
        )}
      </form>
    </div>
  );
}
