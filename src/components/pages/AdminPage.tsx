"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "@/lib/router";
import { PostBlocks, type PostBlock } from "@/components/widgets/PostBlocks";
import { PACKAGES } from "@/lib/content";
import {
  Loader2,
  Lock,
  LogIn,
  LogOut,
  Eye,
  EyeOff,
  AlertCircle,
  LayoutDashboard,
  Package,
  Mail,
  MessageSquareWarning,
  Users,
  DollarSign,
  CreditCard,
  TrendingUp,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ExternalLink,
  Wifi,
  Router as RouterIcon,
  FileEdit,
  RadioTower,
  Plus,
  Trash2,
  Save,
  X,
  Upload,
  Type,
  Heading2,
  Image as ImageIcon,
  Youtube,
  AudioLines,
  MousePointerClick,
  Quote,
  MapPin,
  ShoppingCart,
  Download,
  Inbox,
  Edit3,
  AlignLeft,
  UserCheck,
  ChartPie,
  Headphones,
  Send,
  Search,
  MessageSquare,
  LifeBuoy,
  Sparkles,
  TrendingUp as TrendIcon,
} from "lucide-react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { AnimatePresence, motion } from "framer-motion";

interface AdminOrder {
  id: string;
  ref: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  packageId: string;
  packagePrice: number;
  streetAddress: string;
  houseNo: string;
  commune: string | null;
  installationDate: string | null;
  status: string;
  createdAt: string;
}

interface AdminMessage {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  telephone: string;
  city: string | null;
  areaOfInterest: string;
  requirements: string | null;
  handled: boolean;
  adminReply?: string | null;
  repliedAt?: string | null;
  createdAt: string;
}

interface AdminComplaint {
  id: string;
  ticket: string;
  name: string;
  email: string;
  telephone: string;
  message: string;
  status: string;
  adminReply?: string | null;
  repliedAt?: string | null;
  createdAt: string;
}

interface AdminTicket {
  id: string;
  ref: string;
  userId: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  adminReply?: string | null;
  repliedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
    customerNo: string | null;
  };
}

interface AdminSubscriber {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
}

interface AdminPackage {
  id: string;
  slug: string;
  name: string;
  price: number;
  currency: string;
  speed: string;
  volume: string;
  features: string[];
  badge: string | null;
  highlighted: boolean;
  active: boolean;
  sortOrder: number;
}

interface AdminEquipment {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  description: string;
  imageUrl: string | null;
  active: boolean;
  sortOrder: number;
}

interface AdminPost {
  id: string;
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  coverImage: string | null;
  content: PostBlock[];
  published: boolean;
  createdAt: string;
}

interface AdminCoverageRequest {
  id: string;
  ref: string;
  name: string;
  phone: string;
  email: string | null;
  address: string;
  houseNo: string | null;
  commune: string | null;
  lat: number | null;
  lng: number | null;
  message: string | null;
  status: string;
  createdAt: string;
}

interface AdminEquipmentOrder {
  id: string;
  ref: string;
  items: { slug: string; name: string; unitPrice: number; qty: number }[];
  total: number;
  buyerName: string;
  buyerPhone: string;
  buyerEmail: string;
  deliveryAddress: string;
  status: string;
  createdAt: string;
}

interface AdminEmail {
  id: string;
  toEmail: string;
  subject: string;
  sent: boolean;
  error: string | null;
  kind: string;
  createdAt: string;
}

interface AdminPaymentTransaction {
  id: string;
  ref: string;
  gateway: string;
  gatewayMode: string;
  type: string;
  targetId: string | null;
  userId: string | null;
  amount: number;
  currency: string;
  status: string;
  description: string | null;
  transactionRef: string | null;
  operatorRef: string | null;
  createdAt: string;
}

interface Overview {
  stats: Record<string, number>;
  orders: AdminOrder[];
  messages: AdminMessage[];
  complaints: AdminComplaint[];
  tickets?: AdminTicket[];
  subscribers: AdminSubscriber[];
  packages: AdminPackage[];
  equipments: AdminEquipment[];
  posts: AdminPost[];
  coverageRequests: AdminCoverageRequest[];
  equipmentOrders: AdminEquipmentOrder[];
  emails: AdminEmail[];
  paymentTransactions?: AdminPaymentTransaction[];
  kycUsers: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
    customerNo: string | null;
    kycStatus: string | null;
    kycDocType: string | null;
    kycDocUrl: string | null;
    createdAt: string;
  }[];
  chart: {
    days: { date: string; count: number }[];
    packageCounts: Record<string, number>;
    monthly: { month: string; subscriptions: number; equipment: number; total: number }[];
  };
}

const ORDER_STATUSES = [
  { id: "pending", label: "En attente" },
  { id: "approved", label: "Install. planifiée" },
  { id: "installed", label: "Installée" },
  { id: "cancelled", label: "Annulée" },
];

const COMPLAINT_STATUSES = [
  { id: "open", label: "Ouverte" },
  { id: "in-progress", label: "En cours" },
  { id: "resolved", label: "Résolue" },
];

const PIE_COLORS = ["#273c88", "#f89e3c", "#e29037", "#7c8bb8"];

export function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Overview | null>(null);
  const [forbidden, setForbidden] = useState(false);
  const { navigate } = useRouter();

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/overview", { cache: "no-store" });
      if (res.status === 403) {
        setForbidden(true);
        setData(null);
      } else {
        const json = await res.json();
        setForbidden(false);
        setData(json);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(() => {
      fetch("/api/admin/overview", { cache: "no-store" })
        .then((r) => {
          if (r.status === 403) {
            setForbidden(true);
            setData(null);
          } else {
            return r.json();
          }
        })
        .then((json) => {
          if (json && json.ok) {
            setForbidden(false);
            setData(json);
          }
        })
        .catch(() => {});
    }, 4000);
    return () => clearInterval(interval);
  }, [load]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-orange" />
      </div>
    );
  }

  if (forbidden) {
    return <AdminLogin onLoggedIn={load} />;
  }

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    window.dispatchEvent(new CustomEvent("lh:auth"));
    setForbidden(true);
    setData(null);
    navigate("/");
  };

  return <AdminDashboard data={data} onRefresh={load} onLogout={logout} />;
}

/* ============ Admin login gate ============ */

function AdminLogin({ onLoggedIn }: { onLoggedIn: () => void }) {
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
      } else if (data.user?.role !== "admin") {
        setError("Ce compte n'a pas accès au back-office.");
      } else {
        onLoggedIn();
      }
    } catch {
      setError("Erreur réseau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] bg-brand-header-gradient flex items-center justify-center px-4 py-16 relative overflow-hidden">
      <div className="absolute inset-0 opacity-15 [background:radial-gradient(circle_at_20%_30%,#fff_0,transparent_45%),radial-gradient(circle_at_80%_70%,#fff_0,transparent_40%)]" />
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md relative"
      >
        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-8">
          <div className="flex flex-col items-center mb-6">
            <div className="h-14 w-14 rounded-2xl bg-brand-header-gradient flex items-center justify-center mb-4 shadow-lg shadow-brand-navy/30">
              <ShieldCheck className="h-7 w-7 text-white" />
            </div>
            <Image src="/img/myliquid.png" alt="MyLiquid" width={140} height={38} className="h-9 w-auto" />
            <h1 className="text-xl font-bold text-brand-navy mt-3">Back-office Liquid Home</h1>
            <p className="text-sm text-brand-muted">Accès réservé aux administrateurs</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="relative">
              <LogIn className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-muted" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@liquid.tech"
                className="input-brand pl-10"
              />
            </div>
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

            {error && (
              <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-brand btn-brand-block btn-brand-lg">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Connexion...
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  Accéder au back-office
                </>
              )}
            </button>
          </form>

          <div className="mt-4 rounded-lg bg-brand-soft/70 border border-gray-200 px-3 py-2 text-xs text-brand-muted text-center">
            Démo admin : <span className="font-semibold text-brand-navy">admin@liquid.tech</span> /{" "}
            <span className="font-semibold text-brand-navy">Admin1234</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ============ Dashboard ============ */

const ADMIN_TABS = [
  { id: "overview", label: "Aperçu", icon: LayoutDashboard },
  { id: "orders", label: "Commandes", icon: Package },
  { id: "payments", label: "Paiements", icon: CreditCard },
  { id: "tickets", label: "Tickets Support", icon: Headphones },
  { id: "pkgs", label: "Forfaits", icon: Wifi },
  { id: "equip", label: "Équipements", icon: RouterIcon },
  { id: "posts", label: "Infos & Tutos", icon: FileEdit },
  { id: "covreq", label: "Demandes couv.", icon: RadioTower },
  { id: "eqorders", label: "Ventes équip.", icon: ShoppingCart },
  { id: "emails", label: "Emails", icon: Mail },
  { id: "kyc", label: "Vérifications", icon: UserCheck },
  { id: "cookies", label: "Cookies", icon: ChartPie },
  { id: "messages", label: "Messages", icon: Mail },
  { id: "complaints", label: "Réclamations", icon: MessageSquareWarning },
  { id: "subscribers", label: "Newsletter", icon: Users },
] as const;

type AdminTab = (typeof ADMIN_TABS)[number]["id"];

function AdminDashboard({
  data,
  onRefresh,
  onLogout,
}: {
  data: Overview | null;
  onRefresh: () => void;
  onLogout: () => void;
}) {
  const { navigate } = useRouter();
  const [tab, setTab] = useState<AdminTab>("overview");
  const stats = data?.stats ?? {};

  return (
    <div className="bg-brand-soft/60 min-h-screen">
      {/* Header */}
      <div className="bg-brand-header-gradient text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 [background:radial-gradient(circle_at_85%_15%,#fff_0,transparent_40%)]" />
        <div className="max-w-7xl mx-auto px-4 py-8 relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-white/15 backdrop-blur border border-white/25 flex items-center justify-center">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">Back-office</h1>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[11px] font-semibold">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                    </span>
                    Live Sync Direct
                  </span>
                </div>
                <p className="text-white/70 text-sm">Pilotage Liquid Home RDC • Actualisation en temps réel</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onRefresh()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold transition-colors"
              title="Forcer l'actualisation immédiate"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Actualiser
            </button>
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-sm font-semibold transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              Voir le site
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

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 mb-6">
          {ADMIN_TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            const badge =
              t.id === "orders"
                ? stats.ordersPending
                : t.id === "tickets"
                  ? stats.ticketsOpen
                  : t.id === "messages"
                    ? stats.messagesNew
                    : t.id === "complaints"
                      ? stats.complaintsOpen
                      : t.id === "covreq"
                        ? stats.coverageRequestsNew
                        : t.id === "eqorders"
                          ? stats.equipmentOrdersPending
                          : 0;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                  active
                    ? "bg-brand-navy text-white shadow-md shadow-brand-navy/25"
                    : "bg-white text-brand-muted hover:text-brand-navy border border-gray-100"
                }`}
              >
                <Icon className="h-4 w-4" />
                {t.label}
                {badge > 0 && (
                  <span className="ml-1 h-5 min-w-5 px-1 rounded-full bg-brand-orange text-white text-[11px] font-bold flex items-center justify-center">
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {tab === "overview" && <OverviewTab data={data} />}
            {tab === "orders" && <OrdersTab orders={data?.orders ?? []} onRefresh={onRefresh} />}
            {tab === "payments" && <PaymentsTab transactions={data?.paymentTransactions ?? []} />}
            {tab === "tickets" && <TicketsTab tickets={data?.tickets ?? []} onRefresh={onRefresh} />}
            {tab === "pkgs" && <PackagesTab packages={data?.packages ?? []} onRefresh={onRefresh} />}
            {tab === "equip" && <EquipmentsTab equipments={data?.equipments ?? []} onRefresh={onRefresh} />}
            {tab === "posts" && <PostsTab posts={data?.posts ?? []} onRefresh={onRefresh} />}
            {tab === "covreq" && <CoverageRequestsTab requests={data?.coverageRequests ?? []} onRefresh={onRefresh} />}
            {tab === "eqorders" && <EquipmentOrdersTab orders={data?.equipmentOrders ?? []} onRefresh={onRefresh} />}
            {tab === "emails" && <EmailsTab emails={data?.emails ?? []} />}
            {tab === "kyc" && <KycTab users={data?.kycUsers ?? []} onRefresh={onRefresh} />}
            {tab === "cookies" && <TrackingTab />}
            {tab === "messages" && <MessagesTab messages={data?.messages ?? []} onRefresh={onRefresh} />}
            {tab === "complaints" && <ComplaintsTab complaints={data?.complaints ?? []} onRefresh={onRefresh} />}
            {tab === "subscribers" && <SubscribersTab subscribers={data?.subscribers ?? []} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ============ Overview ============ */

function OverviewTab({ data }: { data: Overview | null }) {
  if (!data) return null;
  const { stats, chart } = data;
  const kpis = [
    { label: "Commandes", value: stats.ordersTotal, sub: `${stats.ordersPending} en attente`, icon: Package, accent: "from-brand-navy to-[#3550a5]" },
    { label: "Clients", value: stats.clients, sub: "comptes actifs", icon: Users, accent: "from-brand-orange to-brand-orange-hover" },
    { label: "Revenus encaissés", value: `${stats.revenuePaid} $`, sub: `${stats.revenuePending} $ en attente`, icon: DollarSign, accent: "from-green-500 to-emerald-600" },
    { label: "Tickets Support", value: stats.tickets ?? 0, sub: `${stats.ticketsOpen ?? 0} ouverts`, icon: Headphones, accent: "from-blue-600 to-indigo-700" },
    { label: "Ventes équipements", value: `${stats.equipmentRevenue} $`, sub: `${stats.equipmentOrders} commandes`, icon: ShoppingCart, accent: "from-amber-500 to-orange-600" },
    { label: "Réclamations", value: stats.complaints, sub: `${stats.complaintsOpen} non résolues`, icon: MessageSquareWarning, accent: "from-red-500 to-rose-600" },
    { label: "Messages", value: stats.messages, sub: `${stats.messagesNew} nouveaux`, icon: Mail, accent: "from-violet-500 to-purple-600" },
    { label: "Newsletter", value: stats.subscribers, sub: "abonnés", icon: TrendingUp, accent: "from-sky-500 to-blue-600" },
  ];

  const pieData = Object.entries(chart.packageCounts).map(([id, count]) => ({
    name: PACKAGES.find((p) => p.id === id)?.name ?? id,
    value: count,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((k, i) => {
          const Icon = k.icon;
          return (
            <motion.div
              key={k.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.35 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow"
            >
              <div className={`h-9 w-9 rounded-lg bg-gradient-to-br ${k.accent} flex items-center justify-center text-white mb-2.5 shadow-md`}>
                <Icon className="h-4.5 w-4.5" />
              </div>
              <p className="text-xs text-brand-muted font-semibold uppercase tracking-wide">{k.label}</p>
              <p className="text-xl font-bold text-brand-navy">{k.value}</p>
              <p className="text-[11px] text-brand-muted">{k.sub}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-brand-navy mb-1">Commandes — 14 derniers jours</h3>
          <p className="text-xs text-brand-muted mb-4">Volume de souscriptions par jour</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chart.days} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef0f4" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#666" }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#666" }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(v) => [v, "Commandes"]}
                  contentStyle={{ borderRadius: 12, border: "1px solid #eee", boxShadow: "0 8px 24px rgba(39,60,136,.12)" }}
                />
                <Bar dataKey="count" fill="#f89e3c" radius={[6, 6, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-brand-navy mb-1">Répartition par forfait</h3>
          <p className="text-xs text-brand-muted mb-4">Toutes commandes confondues</p>
          <div className="h-64">
            {pieData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-brand-muted">Aucune commande</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={4}>
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #eee" }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Monthly revenue classification + exports */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-brand-navy">Revenus par mois (12 derniers mois)</h3>
            <p className="text-xs text-brand-muted">Abonnements payés + ventes d&apos;équipements</p>
          </div>
          <div className="flex gap-2">
            <a href="/api/admin/export?scope=sales" className="btn-brand text-xs px-4 py-2">
              <Download className="h-3.5 w-3.5" />
              Exporter ventes (CSV/Excel)
            </a>
            <a href="/api/admin/export?scope=emails" className="btn-navy text-xs px-4 py-2">
              <Download className="h-3.5 w-3.5" />
              Exporter emails
            </a>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="bg-brand-soft/60 text-left text-brand-navy">
                <th className="px-6 py-3 font-semibold">Mois</th>
                <th className="px-6 py-3 font-semibold text-right">Abonnements</th>
                <th className="px-6 py-3 font-semibold text-right">Équipements</th>
                <th className="px-6 py-3 font-semibold text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {chart.monthly.map((m) => (
                <tr key={m.month} className="border-t border-gray-100 hover:bg-brand-soft/40 transition-colors">
                  <td className="px-6 py-2.5 font-semibold text-brand-navy capitalize">{m.month}</td>
                  <td className="px-6 py-2.5 text-right text-brand-muted">{m.subscriptions} $</td>
                  <td className="px-6 py-2.5 text-right text-brand-muted">{m.equipment} $</td>
                  <td className="px-6 py-2.5 text-right font-bold text-brand-orange">{m.total} $</td>
                </tr>
              ))}
              <tr className="border-t-2 border-brand-navy bg-brand-soft/40">
                <td className="px-6 py-3 font-bold text-brand-navy">Total 12 mois</td>
                <td className="px-6 py-3 text-right font-bold text-brand-navy">{chart.monthly.reduce((s2, m) => s2 + m.subscriptions, 0)} $</td>
                <td className="px-6 py-3 text-right font-bold text-brand-navy">{chart.monthly.reduce((s2, m) => s2 + m.equipment, 0)} $</td>
                <td className="px-6 py-3 text-right font-extrabold text-brand-orange">{chart.monthly.reduce((s2, m) => s2 + m.total, 0)} $</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ============ Orders ============ */

function OrdersTab({ orders, onRefresh }: { orders: AdminOrder[]; onRefresh: () => void }) {
  const [updating, setUpdating] = useState<string | null>(null);

  const setStatus = async (id: string, status: string) => {
    setUpdating(id);
    try {
      await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      onRefresh();
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[860px]">
          <thead>
            <tr className="bg-brand-soft/60 text-left text-brand-navy">
              <th className="px-5 py-3.5 font-semibold">Réf</th>
              <th className="px-5 py-3.5 font-semibold">Client</th>
              <th className="px-5 py-3.5 font-semibold">Forfait</th>
              <th className="px-5 py-3.5 font-semibold">Adresse</th>
              <th className="px-5 py-3.5 font-semibold">Date</th>
              <th className="px-5 py-3.5 font-semibold">Statut</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-brand-muted">
                  Aucune commande pour le moment
                </td>
              </tr>
            )}
            {orders.map((o) => (
              <tr key={o.id} className="border-t border-gray-100 hover:bg-brand-soft/40 transition-colors">
                <td className="px-5 py-4 font-mono text-xs font-semibold text-brand-navy">{o.ref}</td>
                <td className="px-5 py-4">
                  <p className="font-semibold text-brand-navy">{o.firstName} {o.lastName}</p>
                  <p className="text-xs text-brand-muted">{o.email} · {o.phone}</p>
                </td>
                <td className="px-5 py-4">
                  <span className="font-semibold text-brand-navy">{PACKAGES.find((p) => p.id === o.packageId)?.name ?? o.packageId}</span>
                  <p className="text-xs text-brand-orange font-bold">{o.packagePrice} USD</p>
                </td>
                <td className="px-5 py-4 text-brand-muted">
                  {o.streetAddress}, {o.houseNo}
                  {o.commune ? ` · ${o.commune}` : ""}
                </td>
                <td className="px-5 py-4 text-brand-muted">{new Date(o.createdAt).toLocaleDateString("fr-FR")}</td>
                <td className="px-5 py-4">
                  {updating === o.id ? (
                    <Loader2 className="h-4 w-4 animate-spin text-brand-orange" />
                  ) : (
                    <select
                      value={o.status}
                      onChange={(e) => setStatus(o.id, e.target.value)}
                      className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-orange/40 cursor-pointer ${
                        o.status === "installed"
                          ? "border-green-200 bg-green-50 text-green-700"
                          : o.status === "cancelled"
                            ? "border-red-200 bg-red-50 text-red-700"
                            : o.status === "approved"
                              ? "border-blue-200 bg-blue-50 text-blue-700"
                              : "border-amber-200 bg-amber-50 text-amber-800"
                      }`}
                    >
                      {ORDER_STATUSES.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-5 py-3 bg-brand-soft/40 text-xs text-brand-muted flex items-center gap-2">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Passer une commande en « Installée » génère automatiquement la première facture client.
      </div>
    </div>
  );
}

/* ============ Tickets Support ============ */

function TicketsTab({ tickets, onRefresh }: { tickets: AdminTicket[]; onRefresh: () => void }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const filtered = tickets.filter((t) => {
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchRef = t.ref.toLowerCase().includes(q);
      const matchSubject = t.subject.toLowerCase().includes(q);
      const matchMessage = t.message.toLowerCase().includes(q);
      const matchName = (t.user?.name || "").toLowerCase().includes(q);
      const matchEmail = (t.user?.email || "").toLowerCase().includes(q);
      const matchCust = (t.user?.customerNo || "").toLowerCase().includes(q);
      if (!matchRef && !matchSubject && !matchMessage && !matchName && !matchEmail && !matchCust) {
        return false;
      }
    }
    return true;
  });

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdatingStatus(id);
    try {
      await fetch("/api/admin/tickets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      onRefresh();
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handlePriorityChange = async (id: string, newPriority: string) => {
    try {
      await fetch("/api/admin/tickets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, priority: newPriority }),
      });
      onRefresh();
    } catch {}
  };

  const handleSendReply = async (id: string) => {
    if (!replyText.trim()) return;
    setSending(true);
    try {
      const res = await fetch("/api/admin/tickets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, adminReply: replyText.trim(), status: "in-progress" }),
      });
      if (res.ok) {
        setReplyingId(null);
        setReplyText("");
        onRefresh();
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter toolbar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher réf, client, sujet..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-orange/30"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
          <span className="text-xs font-bold text-brand-navy">Statut :</span>
          {["all", "open", "in-progress", "resolved"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                statusFilter === s
                  ? "bg-brand-navy text-white"
                  : "bg-gray-100 text-brand-muted hover:bg-gray-200"
              }`}
            >
              {s === "all" ? "Tous" : s === "open" ? "Ouverts" : s === "in-progress" ? "En cours" : "Résolus"}
            </button>
          ))}

          <span className="text-xs font-bold text-brand-navy ml-2">Urgence :</span>
          {["all", "normal", "high", "urgent"].map((p) => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              className={`text-xs px-2.5 py-1.5 rounded-lg font-semibold transition-colors ${
                priorityFilter === p
                  ? "bg-brand-orange text-white"
                  : "bg-gray-100 text-brand-muted hover:bg-gray-200"
              }`}
            >
              {p === "all" ? "Toutes" : p === "normal" ? "Normale" : p === "high" ? "Haute" : "Urgente"}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Headphones} text="Aucun ticket support correspondant" />
      ) : (
        <div className="space-y-4">
          {filtered.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="px-2.5 py-1 rounded-lg bg-brand-navy text-white text-xs font-mono font-bold">
                    {t.ref}
                  </span>
                  <h3 className="font-bold text-brand-navy text-base">{t.subject}</h3>
                  {t.priority === "urgent" && (
                    <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold uppercase tracking-wider">
                      Urgente
                    </span>
                  )}
                  {t.priority === "high" && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider">
                      Haute
                    </span>
                  )}
                  {t.priority === "normal" && (
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wider">
                      Normale
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Priority selector */}
                  <select
                    value={t.priority}
                    onChange={(e) => handlePriorityChange(t.id, e.target.value)}
                    className="text-xs rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 font-medium text-brand-muted"
                  >
                    <option value="normal">Prio: Normale</option>
                    <option value="high">Prio: Haute</option>
                    <option value="urgent">Prio: Urgente</option>
                  </select>

                  {/* Status selector */}
                  <select
                    value={t.status}
                    onChange={(e) => handleStatusChange(t.id, e.target.value)}
                    disabled={updatingStatus === t.id}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-bold focus:outline-none cursor-pointer ${
                      t.status === "resolved"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : t.status === "in-progress"
                          ? "border-blue-200 bg-blue-50 text-blue-700"
                          : "border-amber-200 bg-amber-50 text-amber-800"
                    }`}
                  >
                    <option value="open">Statut : Ouvert</option>
                    <option value="in-progress">Statut : En cours</option>
                    <option value="resolved">Statut : Résolu</option>
                  </select>
                </div>
              </div>

              {/* Client Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-brand-soft/50 rounded-xl p-3 text-xs text-brand-navy">
                <div>
                  <span className="text-brand-muted block text-[10px] uppercase font-bold">Client</span>
                  <span className="font-semibold">{t.user?.name || "Client Liquid"}</span>
                  {t.user?.customerNo && (
                    <span className="ml-1.5 font-mono text-[11px] text-brand-orange font-bold">({t.user.customerNo})</span>
                  )}
                </div>
                <div>
                  <span className="text-brand-muted block text-[10px] uppercase font-bold">Contact</span>
                  <a href={`mailto:${t.user?.email}`} className="text-brand-navy hover:text-brand-orange font-medium underline">
                    {t.user?.email || "—"}
                  </a>
                  {t.user?.phone && (
                    <span className="text-brand-muted block">{t.user.phone}</span>
                  )}
                </div>
                <div>
                  <span className="text-brand-muted block text-[10px] uppercase font-bold">Date d&apos;ouverture</span>
                  <span>{new Date(t.createdAt).toLocaleString("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                </div>
              </div>

              {/* Client Message */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-xs text-gray-800 leading-relaxed">
                <span className="font-bold text-brand-navy block mb-1 text-[11px]">Message transmis par le client :</span>
                <p className="whitespace-pre-wrap">{t.message}</p>
              </div>

              {/* Previous Admin Reply */}
              {t.adminReply && (
                <div className="bg-brand-soft/70 border-l-4 border-brand-orange rounded-r-xl p-4 text-xs text-brand-navy space-y-1">
                  <div className="flex items-center justify-between font-bold text-brand-orange text-[11px]">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Réponse officielle transmise au client
                    </span>
                    {t.repliedAt && (
                      <span className="text-[10px] text-brand-muted font-normal">
                        {new Date(t.repliedAt).toLocaleString("fr-FR")}
                      </span>
                    )}
                  </div>
                  <p className="whitespace-pre-wrap leading-relaxed text-brand-navy font-medium bg-white/80 p-3 rounded-lg border border-brand-orange/20">
                    {t.adminReply}
                  </p>
                </div>
              )}

              {/* Reply Form */}
              {replyingId === t.id ? (
                <div className="bg-white border border-brand-orange/30 rounded-xl p-4 space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-brand-navy flex items-center gap-1.5">
                      <Send className="h-3.5 w-3.5 text-brand-orange" />
                      Rédiger une réponse officielle (envoyée par email et visible sur MyLiquid)
                    </span>
                    <button
                      onClick={() => setReplyingId(null)}
                      className="text-xs text-brand-muted hover:text-brand-navy"
                    >
                      Annuler
                    </button>
                  </div>

                  {/* Quick snippets */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] text-brand-muted font-bold uppercase">Modèles rapides :</span>
                    {[
                      "Bonjour, notre équipe technique intervient sur votre ligne ce jour.",
                      "Veuillez redémarrer votre routeur fibre pendant 30 secondes.",
                      "L'incident réseau dans votre zone a été entièrement résolu.",
                    ].map((snippet) => (
                      <button
                        key={snippet}
                        type="button"
                        onClick={() => setReplyText((prev) => (prev ? prev + " " + snippet : snippet))}
                        className="text-[11px] px-2 py-1 bg-gray-100 hover:bg-gray-200 text-brand-navy rounded-md transition-colors"
                      >
                        {snippet.slice(0, 32)}...
                      </button>
                    ))}
                  </div>

                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={3}
                    placeholder="Saisissez la réponse technique pour le client..."
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-orange/40 resize-y"
                    autoFocus
                  />

                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setReplyingId(null)}
                      className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-brand-muted hover:bg-gray-50"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={() => handleSendReply(t.id)}
                      disabled={sending || !replyText.trim()}
                      className="btn-brand text-xs px-4 py-2 flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                      Envoyer la réponse au client
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setReplyingId(t.id);
                      setReplyText(t.adminReply || "");
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-orange/10 hover:bg-brand-orange/20 text-brand-orange text-xs font-bold transition-colors"
                  >
                    <Send className="h-3.5 w-3.5" />
                    {t.adminReply ? "Mettre à jour la réponse" : "Répondre au ticket"}
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============ Messages ============ */

function MessagesTab({ messages, onRefresh }: { messages: AdminMessage[]; onRefresh: () => void }) {
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);

  const toggle = async (id: string, handled: boolean) => {
    await fetch("/api/admin/messages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, handled }),
    });
    onRefresh();
  };

  const sendReply = async (id: string) => {
    if (!replyText.trim()) return;
    setSending(true);
    try {
      await fetch("/api/admin/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, adminReply: replyText.trim() }),
      });
      setReplyingId(null);
      setReplyText("");
      onRefresh();
    } finally {
      setSending(false);
    }
  };

  if (messages.length === 0) {
    return <EmptyState icon={Mail} text="Aucun message de contact" />;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {messages.map((m, i) => (
        <motion.div
          key={m.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className={`bg-white rounded-2xl border shadow-sm p-5 space-y-3 ${m.handled ? "opacity-75" : ""}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-bold text-brand-navy">{m.firstName} {m.lastName}</p>
              <p className="text-xs text-brand-muted">
                <a href={`mailto:${m.email}`} className="hover:underline text-brand-orange">{m.email}</a> · {m.telephone}
              </p>
            </div>
            <button
              onClick={() => toggle(m.id, !m.handled)}
              className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-colors ${
                m.handled ? "bg-gray-100 text-gray-600 hover:bg-gray-200" : "bg-brand-orange text-white hover:bg-brand-orange-hover"
              }`}
            >
              {m.handled ? "Traité ✓" : "À traiter"}
            </button>
          </div>

          {m.requirements && (
            <p className="text-xs text-brand-muted bg-brand-soft/60 rounded-xl p-3 leading-relaxed">{m.requirements}</p>
          )}

          {m.adminReply && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-800 space-y-1">
              <span className="font-bold text-[10px] uppercase text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Réponse email transmise :
              </span>
              <p className="whitespace-pre-wrap">{m.adminReply}</p>
            </div>
          )}

          <div className="flex items-center justify-between gap-3 text-xs text-brand-muted pt-1 border-t border-gray-100">
            <span className="bg-brand-soft px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-brand-navy">
              {m.areaOfInterest === "business" ? "Entreprise" : "Domicile"}
            </span>
            <span>{new Date(m.createdAt).toLocaleDateString("fr-FR")}</span>
          </div>

          {/* Reply Section */}
          {replyingId === m.id ? (
            <div className="bg-gray-50 rounded-xl p-3 space-y-2 border border-gray-200">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={2}
                placeholder="Rédiger une réponse par email..."
                className="w-full p-2 bg-white border border-gray-200 rounded-lg text-xs"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setReplyingId(null)}
                  className="px-2.5 py-1 text-xs text-brand-muted rounded-md hover:bg-gray-200"
                >
                  Annuler
                </button>
                <button
                  onClick={() => sendReply(m.id)}
                  disabled={sending || !replyText.trim()}
                  className="btn-brand text-xs px-3 py-1 flex items-center gap-1"
                >
                  {sending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                  Envoyer par email
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-end pt-1">
              <button
                onClick={() => {
                  setReplyingId(m.id);
                  setReplyText(m.adminReply || "");
                }}
                className="text-xs text-brand-orange hover:underline font-bold flex items-center gap-1"
              >
                <Send className="h-3 w-3" />
                {m.adminReply ? "Modifier la réponse email" : "Répondre par email"}
              </button>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}

/* ============ Complaints ============ */

function ComplaintsTab({ complaints, onRefresh }: { complaints: AdminComplaint[]; onRefresh: () => void }) {
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);

  const setStatus = async (id: string, status: string) => {
    await fetch("/api/admin/complaints", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    onRefresh();
  };

  const sendReply = async (id: string) => {
    if (!replyText.trim()) return;
    setSending(true);
    try {
      await fetch("/api/admin/complaints", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, adminReply: replyText.trim(), status: "in-progress" }),
      });
      setReplyingId(null);
      setReplyText("");
      onRefresh();
    } finally {
      setSending(false);
    }
  };

  if (complaints.length === 0) {
    return <EmptyState icon={MessageSquareWarning} text="Aucune réclamation" />;
  }

  return (
    <div className="space-y-4">
      {complaints.map((c, i) => (
        <motion.div
          key={c.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-mono text-xs font-bold text-brand-orange">{c.ticket}</p>
              <p className="font-bold text-brand-navy">{c.name}</p>
              <p className="text-xs text-brand-muted">{c.email} · {c.telephone}</p>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-brand-muted" />
              <span className="text-xs text-brand-muted">{new Date(c.createdAt).toLocaleString("fr-FR")}</span>
            </div>
          </div>

          <p className="text-xs text-brand-muted bg-brand-soft/60 rounded-xl p-3 leading-relaxed">{c.message}</p>

          {c.adminReply && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-800 space-y-1">
              <span className="font-bold text-[10px] uppercase text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Réponse transmise :
              </span>
              <p className="whitespace-pre-wrap">{c.adminReply}</p>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100">
            <div className="flex gap-1.5">
              {COMPLAINT_STATUSES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setStatus(c.id, s.id)}
                  className={`text-xs px-3 py-1 rounded-full font-semibold transition-colors ${
                    c.status === s.id
                      ? "bg-brand-navy text-white"
                      : "bg-brand-soft text-brand-muted hover:bg-gray-200"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setReplyingId(replyingId === c.id ? null : c.id);
                setReplyText(c.adminReply || "");
              }}
              className="text-xs font-bold text-brand-orange hover:underline flex items-center gap-1"
            >
              <Send className="h-3 w-3" />
              {c.adminReply ? "Mettre à jour la réponse" : "Répondre au client"}
            </button>
          </div>

          {replyingId === c.id && (
            <div className="bg-gray-50 rounded-xl p-3 space-y-2 border border-gray-200 animate-in fade-in duration-150">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={2}
                placeholder="Rédiger une réponse de résolution pour le client..."
                className="w-full p-2 bg-white border border-gray-200 rounded-lg text-xs"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setReplyingId(null)}
                  className="px-2.5 py-1 text-xs text-brand-muted rounded-md hover:bg-gray-200"
                >
                  Annuler
                </button>
                <button
                  onClick={() => sendReply(c.id)}
                  disabled={sending || !replyText.trim()}
                  className="btn-brand text-xs px-3 py-1 flex items-center gap-1"
                >
                  {sending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                  Envoyer la réponse
                </button>
              </div>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}

/* ============ Subscribers ============ */

function SubscribersTab({ subscribers }: { subscribers: AdminSubscriber[] }) {
  if (subscribers.length === 0) {
    return <EmptyState icon={Users} text="Aucun abonné newsletter" />;
  }
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-brand-soft/60 text-left text-brand-navy">
            <th className="px-5 py-3.5 font-semibold">Email</th>
            <th className="px-5 py-3.5 font-semibold">Nom</th>
            <th className="px-5 py-3.5 font-semibold">Inscrit le</th>
          </tr>
        </thead>
        <tbody>
          {subscribers.map((s) => (
            <tr key={s.id} className="border-t border-gray-100 hover:bg-brand-soft/40 transition-colors">
              <td className="px-5 py-3.5 font-semibold text-brand-navy">{s.email}</td>
              <td className="px-5 py-3.5 text-brand-muted">{s.name ?? "—"}</td>
              <td className="px-5 py-3.5 text-brand-muted">{new Date(s.createdAt).toLocaleDateString("fr-FR")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EmptyState({ icon: Icon, text }: { icon: typeof Mail; text: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
      <Icon className="h-12 w-12 text-brand-muted/40 mx-auto mb-3" />
      <p className="text-brand-muted">{text}</p>
    </div>
  );
}

/* ============ Packages (forfaits) CRUD ============ */

function PackagesTab({ packages, onRefresh }: { packages: AdminPackage[]; onRefresh: () => void }) {
  const [editing, setEditing] = useState<AdminPackage | "new" | null>(null);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState("");

  const save = async (payload: Record<string, unknown>, id?: string) => {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/packages", {
        method: id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(id ? { ...payload, id } : payload),
      });
      const data = await res.json();
      setFeedback(data.message ?? "");
      if (data.ok) {
        setEditing(null);
        onRefresh();
      }
    } finally {
      setBusy(false);
    }
  };

  const toggleActive = async (p: AdminPackage) => {
    await fetch("/api/admin/packages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: p.id, active: !p.active }),
    });
    onRefresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-brand-navy">Forfaits ({packages.length})</h3>
        <button onClick={() => setEditing("new")} className="btn-brand text-xs px-4 py-2">
          <Plus className="h-4 w-4" />
          Nouveau forfait
        </button>
      </div>
      {feedback && <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">{feedback}</p>}

      {editing && (
        <PackageForm
          initial={editing === "new" ? null : editing}
          busy={busy}
          onCancel={() => setEditing(null)}
          onSave={save}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {packages.map((p) => (
          <div key={p.id} className={`bg-white rounded-2xl border shadow-sm p-5 ${p.active ? "border-gray-100" : "border-gray-200 opacity-60"}`}>
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-bold text-brand-navy text-lg">{p.name}</p>
                <p className="text-xs text-brand-muted font-mono">{p.slug}</p>
              </div>
              <span className="font-extrabold text-brand-orange text-xl">{p.price} $</span>
            </div>
            <p className="text-xs text-brand-muted mb-3">{p.speed} · {p.volume}</p>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {p.highlighted && <span className="text-[10px] font-bold bg-brand-orange text-white px-2 py-0.5 rounded-full">MIS EN AVANT</span>}
              {p.badge && <span className="text-[10px] font-bold bg-brand-navy text-white px-2 py-0.5 rounded-full">{p.badge}</span>}
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                {p.active ? "ACTIF" : "INACTIF"}
              </span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditing(p)} className="flex-1 text-xs font-semibold px-3 py-2 rounded-lg bg-brand-navy text-white hover:bg-brand-navy-light transition-colors">
                Modifier
              </button>
              <button onClick={() => toggleActive(p)} className="text-xs font-semibold px-3 py-2 rounded-lg bg-brand-soft text-brand-navy hover:bg-gray-200 transition-colors">
                {p.active ? "Désactiver" : "Activer"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PackageForm({
  initial,
  busy,
  onCancel,
  onSave,
}: {
  initial: AdminPackage | null;
  busy: boolean;
  onCancel: () => void;
  onSave: (payload: Record<string, unknown>, id?: string) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [price, setPrice] = useState(String(initial?.price ?? ""));
  const [speed, setSpeed] = useState(initial?.speed ?? "");
  const [volume, setVolume] = useState(initial?.volume ?? "Illimités");
  const [badge, setBadge] = useState(initial?.badge ?? "");
  const [highlighted, setHighlighted] = useState(!!initial?.highlighted);
  const [features, setFeatures] = useState((initial?.features ?? [""]).join("\n"));

  return (
    <div className="bg-white rounded-2xl border-2 border-brand-orange/40 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-bold text-brand-navy">{initial ? `Modifier ${initial.name}` : "Nouveau forfait"}</h4>
        <button onClick={onCancel} className="text-brand-muted hover:text-brand-navy"><X className="h-5 w-5" /></button>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave(
            {
              name,
              price: Number(price),
              speed,
              volume,
              badge,
              highlighted,
              features: features.split("\n").map((f) => f.trim()).filter(Boolean),
            },
            initial?.id
          );
        }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <Field label="Nom"><input value={name} onChange={(e) => setName(e.target.value)} required className="input-brand" placeholder="Libota Mega" /></Field>
        <Field label="Prix (USD)"><input value={price} onChange={(e) => setPrice(e.target.value)} required type="number" min="0" step="0.01" className="input-brand" placeholder="99" /></Field>
        <Field label="Débit"><input value={speed} onChange={(e) => setSpeed(e.target.value)} className="input-brand" placeholder="Jusqu'à 500 Mbps" /></Field>
        <Field label="Volume"><input value={volume} onChange={(e) => setVolume(e.target.value)} className="input-brand" placeholder="Illimités" /></Field>
        <Field label="Badge (optionnel)"><input value={badge} onChange={(e) => setBadge(e.target.value)} className="input-brand" placeholder="Populaire" /></Field>
        <label className="flex items-center gap-2 text-sm font-medium text-brand-navy pt-6">
          <input type="checkbox" checked={highlighted} onChange={(e) => setHighlighted(e.target.checked)} className="accent-brand-orange h-4 w-4" />
          Mettre en avant (carte orange)
        </label>
        <div className="md:col-span-2">
          <Field label="Caractéristiques (une par ligne)">
            <textarea value={features} onChange={(e) => setFeatures(e.target.value)} rows={4} className="input-brand resize-y font-mono text-xs" placeholder={"Idéal pour...\nStreaming 4K\nInstallation gratuite"} />
          </Field>
        </div>
        <div className="md:col-span-2 flex gap-2 justify-end">
          <button type="button" onClick={onCancel} className="px-4 py-2.5 rounded-lg bg-brand-soft text-brand-navy text-sm font-semibold hover:bg-gray-200">Annuler</button>
          <button type="submit" disabled={busy} className="btn-brand text-sm">
            <Save className="h-4 w-4" />
            {busy ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ============ Equipment CRUD ============ */

const EQUIP_CAT_LABELS: Record<string, string> = {
  router: "Routeur",
  extender: "Extendeur Wi-Fi",
  powerbank: "Powerbank",
};

function EquipmentsTab({ equipments, onRefresh }: { equipments: AdminEquipment[]; onRefresh: () => void }) {
  const [editing, setEditing] = useState<AdminEquipment | "new" | null>(null);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState("");

  const save = async (payload: Record<string, unknown>, id?: string) => {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/equipments", {
        method: id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(id ? { ...payload, id } : payload),
      });
      const data = await res.json();
      setFeedback(data.message ?? "");
      if (data.ok) {
        setEditing(null);
        onRefresh();
      }
    } finally {
      setBusy(false);
    }
  };

  const remove = async (eq: AdminEquipment) => {
    if (!confirm(`Supprimer « ${eq.name} » ?`)) return;
    const res = await fetch(`/api/admin/equipments?id=${eq.id}`, { method: "DELETE" });
    const data = await res.json();
    setFeedback(data.message ?? "");
    onRefresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-brand-navy">Équipements ({equipments.length})</h3>
        <button onClick={() => setEditing("new")} className="btn-brand text-xs px-4 py-2">
          <Plus className="h-4 w-4" />
          Nouvel équipement
        </button>
      </div>
      {feedback && <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">{feedback}</p>}

      {editing && <EquipmentForm initial={editing === "new" ? null : editing} busy={busy} onCancel={() => setEditing(null)} onSave={save} />}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {equipments.map((eq) => (
          <div key={eq.id} className={`bg-white rounded-2xl border shadow-sm p-5 ${eq.active ? "border-gray-100" : "border-gray-200 opacity-60"}`}>
            <div className="flex items-start justify-between mb-1">
              <p className="font-bold text-brand-navy">{eq.name}</p>
              <span className="font-extrabold text-brand-orange">{eq.price} $</span>
            </div>
            <span className="inline-block text-[10px] font-bold bg-brand-soft text-brand-navy px-2 py-0.5 rounded-full mb-2">
              {EQUIP_CAT_LABELS[eq.category] ?? eq.category}
            </span>
            <p className="text-xs text-brand-muted line-clamp-2 mb-4">{eq.description}</p>
            <div className="flex gap-2">
              <button onClick={() => setEditing(eq)} className="flex-1 text-xs font-semibold px-3 py-2 rounded-lg bg-brand-navy text-white hover:bg-brand-navy-light transition-colors">
                Modifier
              </button>
              <button onClick={() => remove(eq)} className="text-xs font-semibold px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                <Trash2 className="h-3.5 w-3.5 inline" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EquipmentForm({
  initial,
  busy,
  onCancel,
  onSave,
}: {
  initial: AdminEquipment | null;
  busy: boolean;
  onCancel: () => void;
  onSave: (payload: Record<string, unknown>, id?: string) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [category, setCategory] = useState(initial?.category ?? "extender");
  const [price, setPrice] = useState(String(initial?.price ?? ""));
  const [description, setDescription] = useState(initial?.description ?? "");
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? "");

  return (
    <div className="bg-white rounded-2xl border-2 border-brand-orange/40 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-bold text-brand-navy">{initial ? `Modifier ${initial.name}` : "Nouvel équipement"}</h4>
        <button onClick={onCancel} className="text-brand-muted hover:text-brand-navy"><X className="h-5 w-5" /></button>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave({ name, category, price: Number(price), description, imageUrl }, initial?.id);
        }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <Field label="Nom"><input value={name} onChange={(e) => setName(e.target.value)} required className="input-brand" placeholder="Répéteur Mesh Pro" /></Field>
        <Field label="Catégorie">
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-brand">
            <option value="router">Routeur</option>
            <option value="extender">Extendeur Wi-Fi (répéteur)</option>
            <option value="powerbank">Powerbank</option>
          </select>
        </Field>
        <Field label="Prix (USD)"><input value={price} onChange={(e) => setPrice(e.target.value)} required type="number" min="0" step="0.01" className="input-brand" placeholder="29" /></Field>
        <Field label="Image URL (optionnel)"><input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="input-brand" placeholder="/uploads/..." /></Field>
        <div className="md:col-span-2">
          <Field label="Description">
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="input-brand resize-y" placeholder="Étendez la portée de votre Wi-Fi..." />
          </Field>
        </div>
        <div className="md:col-span-2 flex gap-2 justify-end">
          <button type="button" onClick={onCancel} className="px-4 py-2.5 rounded-lg bg-brand-soft text-brand-navy text-sm font-semibold hover:bg-gray-200">Annuler</button>
          <button type="submit" disabled={busy} className="btn-brand text-sm">
            <Save className="h-4 w-4" />
            {busy ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ============ Posts (blog Infos & Tutosa) editor ============ */

function PostsTab({ posts, onRefresh }: { posts: AdminPost[]; onRefresh: () => void }) {
  const [editing, setEditing] = useState<AdminPost | "new" | null>(null);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState("");

  const save = async (payload: Record<string, unknown>, id?: string) => {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/posts", {
        method: id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(id ? { ...payload, id } : payload),
      });
      const data = await res.json();
      setFeedback(data.message ?? "");
      if (data.ok) {
        setEditing(null);
        onRefresh();
      }
    } finally {
      setBusy(false);
    }
  };

  const remove = async (post: AdminPost) => {
    if (!confirm(`Supprimer l'article « ${post.title} » ?`)) return;
    const res = await fetch(`/api/admin/posts?id=${post.id}`, { method: "DELETE" });
    const data = await res.json();
    setFeedback(data.message ?? "");
    onRefresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-brand-navy">Articles ({posts.length})</h3>
        <button onClick={() => setEditing("new")} className="btn-brand text-xs px-4 py-2">
          <Plus className="h-4 w-4" />
          Nouvel article
        </button>
      </div>
      {feedback && <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">{feedback}</p>}

      {editing && <PostForm initial={editing === "new" ? null : editing} busy={busy} onCancel={() => setEditing(null)} onSave={save} />}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {posts.map((p) => (
          <div key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${p.category === "tuto" ? "bg-brand-orange text-white" : "bg-brand-navy text-white"}`}>
                {p.category === "tuto" ? "Tuto" : "Info"}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.published ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                {p.published ? "PUBLIÉ" : "BROUILLON"}
              </span>
            </div>
            <p className="font-bold text-brand-navy leading-snug mb-1">{p.title}</p>
            <p className="text-xs text-brand-muted line-clamp-2 mb-3">{p.excerpt}</p>
            <p className="text-[11px] text-brand-muted mb-3">{new Date(p.createdAt).toLocaleDateString("fr-FR")} · {p.content.length} blocs</p>
            <div className="flex gap-2">
              <button onClick={() => setEditing(p)} className="flex-1 text-xs font-semibold px-3 py-2 rounded-lg bg-brand-navy text-white hover:bg-brand-navy-light transition-colors">
                Éditer
              </button>
              <button onClick={() => remove(p)} className="text-xs font-semibold px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                <Trash2 className="h-3.5 w-3.5 inline" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PostForm({
  initial,
  busy,
  onCancel,
  onSave,
}: {
  initial: AdminPost | null;
  busy: boolean;
  onCancel: () => void;
  onSave: (payload: Record<string, unknown>, id?: string) => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [category, setCategory] = useState(initial?.category ?? "info");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [coverImage, setCoverImage] = useState(initial?.coverImage ?? "");
  const [published, setPublished] = useState(initial?.published ?? true);
  const [blocks, setBlocks] = useState<PostBlock[]>(initial?.content ?? []);
  const [uploading, setUploading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const uploadFile = async (file: File, apply: (url: string) => void) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.ok) apply(data.url);
      else alert(data.message ?? "Échec du téléversement");
    } finally {
      setUploading(false);
    }
  };

  const updateBlock = (i: number, patch: Partial<PostBlock>) =>
    setBlocks((bs) => bs.map((b, j) => (j === i ? { ...b, ...patch } : b)));

  const addBlock = (type: string) => {
    const empty: Record<string, PostBlock> = {
      paragraph: { type: "paragraph", text: "", align: "left" },
      heading: { type: "heading", text: "", align: "left" },
      quote: { type: "quote", text: "" },
      image: { type: "image", url: "", alt: "", align: "left" },
      youtube: { type: "youtube", url: "", title: "" },
      audio: { type: "audio", url: "" },
      button: { type: "button", label: "", url: "", align: "center", variant: "orange" },
    };
    setBlocks((bs) => [...bs, empty[type] ?? { type: "paragraph", text: "" }]);
  };

  const ALIGN_OPTS = [
    { id: "left", label: "Gauche" },
    { id: "center", label: "Centre" },
    { id: "right", label: "Droite" },
  ];

  const move = (i: number, dir: -1 | 1) =>
    setBlocks((bs) => {
      const j = i + dir;
      if (j < 0 || j >= bs.length) return bs;
      const copy = [...bs];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });

  return (
    <div className="bg-white rounded-2xl border-2 border-brand-orange/40 shadow-sm p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-brand-navy">{initial ? `Éditer : ${initial.title}` : "Nouvel article"}</h4>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPreviewMode((v) => !v)}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
              previewMode ? "bg-brand-navy text-white" : "bg-brand-soft text-brand-navy hover:bg-gray-200"
            }`}
          >
            {previewMode ? <Edit3 className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            {previewMode ? "Retour à l'édition" : "Aperçu en direct"}
          </button>
          <button onClick={onCancel} className="text-brand-muted hover:text-brand-navy"><X className="h-5 w-5" /></button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Titre"><input value={title} onChange={(e) => setTitle(e.target.value)} required className="input-brand" placeholder="Bienvenue sur la fibre..." /></Field>
        <Field label="Catégorie">
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-brand">
            <option value="info">Info / Actualité</option>
            <option value="tuto">Tutoriel</option>
          </select>
        </Field>
        <div className="md:col-span-2">
          <Field label="Résumé (extrait)"><input value={excerpt} onChange={(e) => setExcerpt(e.target.value)} className="input-brand" placeholder="Un résumé court affiché sur les cartes..." /></Field>
        </div>
        <div className="md:col-span-2">
          <Field label="Image de couverture (format officiel : 16:9 — 1200 × 675 px recommandé)">
            <div className="flex gap-2">
              <input value={coverImage ?? ""} onChange={(e) => setCoverImage(e.target.value)} className="input-brand" placeholder="/uploads/... ou URL" />
              <label className="btn-navy text-xs whitespace-nowrap cursor-pointer">
                <Upload className="h-3.5 w-3.5" />
                {uploading ? "..." : "Téléverser"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) uploadFile(f, setCoverImage);
                  }}
                />
              </label>
            </div>
            <div className="mt-2 flex items-start gap-3">
              <div className="relative w-44 h-24.75 rounded-lg border-2 border-dashed border-brand-orange/50 bg-orange-50/40 overflow-hidden flex-shrink-0" style={{ aspectRatio: "16/9", width: 176 }}>
                {coverImage ? (
                  <Image src={coverImage} alt="aperçu couverture" fill className="object-cover" unoptimized />
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] text-brand-muted text-center px-2">
                    Aperçu 16:9<br />1200 × 675 px
                  </span>
                )}
              </div>
              <p className="text-[11px] text-brand-muted">
                La couverture s&apos;affiche en haut de l&apos;article et sur les cartes du blog.
                Utilisez une image de <b>1200 × 675 pixels</b> (ratio 16:9) pour un rendu optimal, max 12 Mo.
              </p>
            </div>
          </Field>
        </div>
      </div>

      {/* Aperçu en direct */}
      {previewMode && (
        <div className="rounded-2xl border-2 border-brand-navy/20 bg-white overflow-hidden">
          <div className="bg-brand-soft/60 px-4 py-2 text-xs font-semibold text-brand-navy flex items-center gap-2">
            <Eye className="h-3.5 w-3.5 text-brand-orange" />
            Aperçu en direct — tel que les visiteurs le verront
          </div>
          {coverImage ? (
            <div className="relative h-52 bg-brand-navy">
              <Image src={coverImage} alt="" fill className="object-cover" unoptimized />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <span className={`inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-full mb-2 ${category === "tuto" ? "bg-brand-orange text-white" : "bg-white/90 text-brand-navy"}`}>
                  {category === "tuto" ? "Tutoriel" : "Actualité"}
                </span>
                <h3 className="text-xl md:text-2xl font-bold text-white leading-tight">{title || "Titre de l'article"}</h3>
              </div>
            </div>
          ) : (
            <div className="px-5 pt-5">
              <h3 className="text-2xl font-bold text-brand-navy leading-tight">{title || "Titre de l'article"}</h3>
            </div>
          )}
          <div className="p-5">
            {blocks.length === 0 ? (
              <p className="text-sm text-brand-muted text-center py-6">Ajoutez des blocs pour voir l&apos;aperçu.</p>
            ) : (
              <PostBlocks blocks={blocks} preview />
            )}
          </div>
        </div>
      )}

      {/* Block editor */}
      <div className={previewMode ? "hidden" : ""}>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="text-sm font-semibold text-brand-navy">Contenu ({blocks.length} blocs)</span>
          <div className="flex flex-wrap gap-1.5 ml-auto">
            {[
              { t: "paragraph", icon: Type, l: "Paragraphe" },
              { t: "heading", icon: Heading2, l: "Titre" },
              { t: "image", icon: ImageIcon, l: "Image" },
              { t: "youtube", icon: Youtube, l: "Vidéo" },
              { t: "audio", icon: AudioLines, l: "Audio" },
              { t: "button", icon: MousePointerClick, l: "Bouton" },
              { t: "quote", icon: Quote, l: "Citation" },
            ].map(({ t, icon: Icon, l }) => (
              <button
                key={t}
                type="button"
                onClick={() => addBlock(t)}
                className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-brand-soft text-brand-navy hover:bg-orange-50 hover:text-brand-orange transition-colors"
              >
                <Icon className="h-3.5 w-3.5" />
                {l}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {blocks.map((b, i) => (
            <div key={i} className="rounded-xl border border-gray-200 bg-gray-50/60 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wide text-brand-muted">
                  {b.type === "youtube" ? "Vidéo YouTube" : b.type === "button" ? "Bouton / lien" : b.type}
                </span>
                <div className="flex items-center gap-1.5">
                  {["paragraph", "heading", "image", "audio", "button"].includes(b.type) && (
                    <div className="flex items-center gap-1 bg-white rounded-lg border border-gray-200 px-1.5 py-1">
                      <AlignLeft className="h-3 w-3 text-brand-muted" />
                      {ALIGN_OPTS.map((o) => (
                        <button
                          key={o.id}
                          type="button"
                          onClick={() => updateBlock(i, { align: o.id as PostBlock["align"] })}
                          className={`text-[10px] px-1.5 py-0.5 rounded ${((b.align ?? (b.type === "button" ? "center" : "left")) === o.id) ? "bg-brand-navy text-white font-semibold" : "text-brand-muted hover:bg-gray-100"}`}
                        >
                          {o.label}
                        </button>
                      ))}
                    </div>
                  )}
                  <button type="button" onClick={() => move(i, -1)} className="text-xs px-1.5 text-brand-muted hover:text-brand-navy">↑</button>
                  <button type="button" onClick={() => move(i, 1)} className="text-xs px-1.5 text-brand-muted hover:text-brand-navy">↓</button>
                  <button type="button" onClick={() => setBlocks((bs) => bs.filter((_, j) => j !== i))} className="text-red-500 hover:text-red-700 px-1"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>

              {(b.type === "paragraph" || b.type === "heading" || b.type === "quote") && (
                <textarea
                  value={b.text ?? ""}
                  onChange={(e) => updateBlock(i, { text: e.target.value })}
                  rows={b.type === "paragraph" ? 3 : 1}
                  className="input-brand text-sm"
                  placeholder={b.type === "heading" ? "Titre de section" : "Votre texte..."}
                />
              )}

              {b.type === "image" && (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input value={b.url ?? ""} onChange={(e) => updateBlock(i, { url: e.target.value })} className="input-brand text-sm" placeholder="URL de l'image" />
                    <label className="btn-navy text-xs whitespace-nowrap cursor-pointer">
                      <Upload className="h-3.5 w-3.5" />
                      {uploading ? "..." : "Fichier"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) uploadFile(f, (url) => updateBlock(i, { url }));
                        }}
                      />
                    </label>
                  </div>
                  <input value={b.alt ?? ""} onChange={(e) => updateBlock(i, { alt: e.target.value })} className="input-brand text-sm" placeholder="Texte alternatif (optionnel)" />
                </div>
              )}

              {b.type === "youtube" && (
                <div className="space-y-2">
                  <input value={b.url ?? ""} onChange={(e) => updateBlock(i, { url: e.target.value })} className="input-brand text-sm" placeholder="https://www.youtube.com/embed/VIDEO_ID" />
                  <input value={b.title ?? ""} onChange={(e) => updateBlock(i, { title: e.target.value })} className="input-brand text-sm" placeholder="Légende (optionnel)" />
                </div>
              )}

              {b.type === "audio" && (
                <div className="flex gap-2">
                  <input value={b.url ?? ""} onChange={(e) => updateBlock(i, { url: e.target.value })} className="input-brand text-sm" placeholder="URL du fichier audio" />
                  <label className="btn-navy text-xs whitespace-nowrap cursor-pointer">
                    <Upload className="h-3.5 w-3.5" />
                    {uploading ? "..." : "Fichier"}
                    <input
                      type="file"
                      accept="audio/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) uploadFile(f, (url) => updateBlock(i, { url }));
                      }}
                    />
                  </label>
                </div>
              )}

              {b.type === "button" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <input value={b.label ?? ""} onChange={(e) => updateBlock(i, { label: e.target.value })} className="input-brand text-sm" placeholder="Texte du bouton" />
                  <input value={b.url ?? ""} onChange={(e) => updateBlock(i, { url: e.target.value })} className="input-brand text-sm" placeholder="/packages ou https://..." />
                  <div className="md:col-span-2 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-semibold uppercase text-brand-muted">Style :</span>
                    {[
                      { id: "orange", label: "Orange" },
                      { id: "navy", label: "Navy" },
                      { id: "outline", label: "Contour" },
                    ].map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => updateBlock(i, { variant: v.id as PostBlock["variant"] })}
                        className={`text-[10px] px-2.5 py-1 rounded-full font-semibold ${(b.variant ?? "orange") === v.id ? "bg-brand-orange text-white" : "bg-white border border-gray-200 text-brand-muted hover:bg-gray-50"}`}
                      >
                        {v.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
          {blocks.length === 0 && (
            <p className="text-sm text-brand-muted text-center py-6 border-2 border-dashed border-gray-200 rounded-xl">
              Ajoutez des blocs avec les boutons ci-dessus pour composer l&apos;article.
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 justify-between pt-2 border-t border-gray-100">
        <label className="flex items-center gap-2 text-sm font-medium text-brand-navy">
          <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="accent-brand-orange h-4 w-4" />
          Publier immédiatement
        </label>
        <div className="flex gap-2">
          <button type="button" onClick={onCancel} className="px-4 py-2.5 rounded-lg bg-brand-soft text-brand-navy text-sm font-semibold hover:bg-gray-200">Annuler</button>
          <button
            type="button"
            disabled={busy}
            onClick={() => onSave({ title, category, excerpt, coverImage, published, content: blocks }, initial?.id)}
            className="btn-brand text-sm"
          >
            <Save className="h-4 w-4" />
            {busy ? "Enregistrement..." : "Enregistrer l'article"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============ Coverage requests ============ */

const COVREQ_STATUSES = [
  { id: "new", label: "Nouvelle" },
  { id: "contacted", label: "Contactée" },
  { id: "covered", label: "Couverture faite" },
];

function CoverageRequestsTab({ requests, onRefresh }: { requests: AdminCoverageRequest[]; onRefresh: () => void }) {
  const setStatus = async (id: string, status: string) => {
    await fetch("/api/admin/coverage-requests", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    onRefresh();
  };

  if (requests.length === 0) {
    return <EmptyState icon={RadioTower} text="Aucune demande de couverture" />;
  }

  return (
    <div className="space-y-4">
      {requests.map((r, i) => (
        <motion.div
          key={r.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-mono text-xs text-brand-muted">{r.ref}</p>
              <p className="font-bold text-brand-navy">{r.name}</p>
              <p className="text-xs text-brand-muted">{r.phone}{r.email ? ` · ${r.email}` : ""}</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-brand-muted">
              <MapPin className="h-3.5 w-3.5" />
              <span>{new Date(r.createdAt).toLocaleString("fr-FR")}</span>
            </div>
          </div>
          <p className="text-sm text-brand-muted bg-brand-soft/60 rounded-lg p-3 mt-3">
            📍 {r.address}{r.houseNo ? `, n° ${r.houseNo}` : ""}{r.commune ? ` · ${r.commune}` : ""}
            {r.lat && r.lng ? ` (${r.lat.toFixed(4)}, ${r.lng.toFixed(4)})` : ""}
          </p>
          {r.message && <p className="text-sm text-brand-muted mt-2 italic">« {r.message} »</p>}
          <div className="flex gap-2 mt-3">
            {COVREQ_STATUSES.map((s) => (
              <button
                key={s.id}
                onClick={() => setStatus(r.id, s.id)}
                className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-colors ${
                  r.status === s.id ? "bg-brand-navy text-white" : "bg-brand-soft text-brand-muted hover:bg-gray-200"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ============ Small form field helper ============ */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-brand-navy mb-2">{label}</label>
      {children}
    </div>
  );
}

/* ============ Equipment sales ============ */

const EQ_STATUSES = [
  { id: "pending", label: "En attente" },
  { id: "confirmed", label: "Confirmée" },
  { id: "delivered", label: "Livrée" },
  { id: "cancelled", label: "Annulée" },
];

function EquipmentOrdersTab({ orders, onRefresh }: { orders: AdminEquipmentOrder[]; onRefresh: () => void }) {
  const setStatus = async (id: string, status: string) => {
    await fetch("/api/admin/equipment-orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    onRefresh();
  };

  if (orders.length === 0) {
    return <EmptyState icon={ShoppingCart} text="Aucune vente d'équipement pour le moment" />;
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[820px]">
          <thead>
            <tr className="bg-brand-soft/60 text-left text-brand-navy">
              <th className="px-5 py-3.5 font-semibold">Réf</th>
              <th className="px-5 py-3.5 font-semibold">Client</th>
              <th className="px-5 py-3.5 font-semibold">Articles</th>
              <th className="px-5 py-3.5 font-semibold">Livraison</th>
              <th className="px-5 py-3.5 font-semibold">Total</th>
              <th className="px-5 py-3.5 font-semibold">Statut</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t border-gray-100 hover:bg-brand-soft/40 transition-colors">
                <td className="px-5 py-4 font-mono text-xs font-semibold text-brand-navy">{o.ref}</td>
                <td className="px-5 py-4">
                  <p className="font-semibold text-brand-navy">{o.buyerName}</p>
                  <p className="text-xs text-brand-muted">{o.buyerEmail} · {o.buyerPhone}</p>
                </td>
                <td className="px-5 py-4 text-brand-muted">
                  {o.items.map((i, j) => (
                    <p key={j} className="text-xs">{i.name} × {i.qty} — {i.unitPrice * i.qty} $</p>
                  ))}
                </td>
                <td className="px-5 py-4 text-brand-muted text-xs">{o.deliveryAddress}</td>
                <td className="px-5 py-4 font-bold text-brand-orange whitespace-nowrap">{o.total} $</td>
                <td className="px-5 py-4">
                  <select
                    value={o.status}
                    onChange={(e) => setStatus(o.id, e.target.value)}
                    className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-orange/40 cursor-pointer ${
                      o.status === "delivered"
                        ? "border-green-200 bg-green-50 text-green-700"
                        : o.status === "cancelled"
                          ? "border-red-200 bg-red-50 text-red-700"
                          : o.status === "confirmed"
                            ? "border-blue-200 bg-blue-50 text-blue-700"
                            : "border-amber-200 bg-amber-50 text-amber-800"
                    }`}
                  >
                    {EQ_STATUSES.map((st) => (
                      <option key={st.id} value={st.id}>{st.label}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ============ Emails outbox ============ */

function EmailsTab({ emails }: { emails: AdminEmail[] }) {
  if (emails.length === 0) {
    return <EmptyState icon={Inbox} text="Aucun email envoyé pour le moment" />;
  }
  return (
    <div className="space-y-3">
      <p className="text-xs text-brand-muted">
        Boîte d&apos;envoi transactionnelle. Sans <code className="bg-brand-soft px-1 rounded">SMTP_URL</code> configurée,
        les emails sont journalisés ici (et consultables) mais pas réellement délivrés.
      </p>
      {emails.map((e, i) => (
        <motion.div
          key={e.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div className="min-w-0">
              <p className="font-semibold text-brand-navy truncate">{e.subject}</p>
              <p className="text-xs text-brand-muted">À : {e.toEmail}</p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="bg-brand-soft text-brand-navy px-2 py-0.5 rounded-full font-semibold">{e.kind}</span>
              <span className={`px-2 py-0.5 rounded-full font-semibold ${e.sent ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-800"}`}>
                {e.sent ? "SMTP ✓" : "journalisé"}
              </span>
              <span className="text-brand-muted">{new Date(e.createdAt).toLocaleString("fr-FR")}</span>
            </div>
          </div>
          {!e.sent && e.error && <p className="text-[11px] text-amber-700">{e.error}</p>}
        </motion.div>
      ))}
    </div>
  );
}

/* ============ KYC identity review ============ */

const KYC_TYPE_LABELS: Record<string, string> = {
  passport: "Passeport",
  voter: "Carte d'électeur",
  license: "Permis de conduire",
  other: "Autre",
};

interface KycUser {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  customerNo: string | null;
  kycStatus: string | null;
  kycDocType: string | null;
  kycDocUrl: string | null;
  createdAt: string;
}

function KycTab({ users, onRefresh }: { users: KycUser[]; onRefresh: () => void }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");

  const review = async (userId: string, status: string) => {
    setBusy(userId);
    try {
      const res = await fetch("/api/admin/kyc", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, status }),
      });
      const data = await res.json();
      setFeedback(data.message ?? "");
      onRefresh();
    } finally {
      setBusy(null);
    }
  };

  const pending = users.filter((u) => u.kycStatus === "pending");
  const reviewed = users.filter((u) => u.kycStatus === "approved" || u.kycStatus === "rejected");

  return (
    <div className="space-y-5">
      {feedback && <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">{feedback}</p>}

      <div>
        <h3 className="font-bold text-brand-navy mb-3">En attente de vérification ({pending.length})</h3>
        {pending.length === 0 ? (
          <EmptyState icon={UserCheck} text="Aucune identité en attente" />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {pending.map((u) => (
              <div key={u.id} className="bg-white rounded-2xl border-2 border-amber-200 shadow-sm p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="font-bold text-brand-navy">{u.name ?? u.email}</p>
                    <p className="text-xs text-brand-muted">{u.email}{u.phone ? ` · ${u.phone}` : ""}</p>
                    <p className="text-xs text-brand-muted mt-0.5">Client n° {u.customerNo ?? "—"} · inscrit le {new Date(u.createdAt).toLocaleDateString("fr-FR")}</p>
                  </div>
                  <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-800 px-2 py-1 rounded-full whitespace-nowrap">
                    {KYC_TYPE_LABELS[u.kycDocType ?? "other"] ?? "Pièce"}
                  </span>
                </div>
                {u.kycDocUrl && (
                  <a
                    href={u.kycDocUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-xl border border-gray-200 bg-brand-soft/40 px-4 py-3 text-sm font-semibold text-brand-navy hover:bg-orange-50 transition-colors mb-4"
                  >
                    📄 Voir le document fourni →
                  </a>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => review(u.id, "approved")}
                    disabled={busy === u.id}
                    className="flex-1 btn-brand text-xs py-2.5"
                  >
                    ✓ Valider l'identité
                  </button>
                  <button
                    onClick={() => review(u.id, "rejected")}
                    disabled={busy === u.id}
                    className="flex-1 px-4 py-2.5 rounded-lg bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition-colors"
                  >
                    ✕ Rejeter
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {reviewed.length > 0 && (
        <div>
          <h3 className="font-bold text-brand-navy mb-3">Historique ({reviewed.length})</h3>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-brand-soft/60 text-left text-brand-navy">
                  <th className="px-5 py-3 font-semibold">Client</th>
                  <th className="px-5 py-3 font-semibold">Pièce</th>
                  <th className="px-5 py-3 font-semibold">Statut</th>
                  <th className="px-5 py-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {reviewed.map((u) => (
                  <tr key={u.id} className="border-t border-gray-100 hover:bg-brand-soft/40 transition-colors">
                    <td className="px-5 py-3">
                      <p className="font-semibold text-brand-navy">{u.name ?? u.email}</p>
                      <p className="text-xs text-brand-muted">{u.email}</p>
                    </td>
                    <td className="px-5 py-3 text-brand-muted text-xs">{KYC_TYPE_LABELS[u.kycDocType ?? "other"] ?? "—"}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${u.kycStatus === "approved" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {u.kycStatus === "approved" ? "Vérifiée" : "Rejetée"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      {u.kycDocUrl && (
                        <a href={u.kycDocUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-brand-orange hover:underline">
                          Voir
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============ Cookies & audience tracking ============ */

interface TrackingData {
  stats: { events: number; pageviews: number; clicks: number; sessions: number; accepted: number; refused: number };
  topPages: { path: string; count: number }[];
  topClicks: { label: string; count: number }[];
  sessions: { sid: string; events: number; lastAt: string | null; journey: string }[];
  recent: { id: string; sid: string; kind: string; path: string | null; label: string | null; createdAt: string }[];
}

function TrackingTab() {
  const [data, setData] = useState<TrackingData | null>(null);
  const [days, setDays] = useState(30);

  useEffect(() => {
    let cancelled = false;
    const raf = requestAnimationFrame(() => setData(null));
    fetch(`/api/admin/tracking?days=${days}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled && d.ok) setData(d);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [days]);

  if (!data) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-brand-orange" />
      </div>
    );
  }

  const consentTotal = data.stats.accepted + data.stats.refused;
  const acceptRate = consentTotal ? Math.round((data.stats.accepted / consentTotal) * 100) : 0;

  const kpis = [
    { label: "Sessions visiteurs", value: data.stats.sessions, icon: Users, accent: "from-brand-navy to-[#3550a5]" },
    { label: "Pages vues", value: data.stats.pageviews, icon: ChartPie, accent: "from-brand-orange to-brand-orange-hover" },
    { label: "Clics suivis", value: data.stats.clicks, icon: TrendIcon, accent: "from-violet-500 to-purple-600" },
    { label: "Consentement", value: `${acceptRate}%`, sub: `${data.stats.accepted} acceptés · ${data.stats.refused} refusés`, icon: ShieldCheck, accent: "from-green-500 to-emerald-600" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-brand-navy">Audience & comportement cookies</h3>
          <p className="text-xs text-brand-muted">Les événements ne sont enregistrés qu&apos;après consentement explicite du visiteur.</p>
        </div>
        <div className="flex gap-1.5">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                days === d ? "bg-brand-navy text-white" : "bg-white border border-gray-200 text-brand-muted hover:bg-gray-50"
              }`}
            >
              {d} j
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className={`h-9 w-9 rounded-lg bg-gradient-to-br ${k.accent} flex items-center justify-center text-white mb-2.5 shadow-md`}>
                <Icon className="h-4.5 w-4.5" />
              </div>
              <p className="text-xs text-brand-muted font-semibold uppercase tracking-wide">{k.label}</p>
              <p className="text-xl font-bold text-brand-navy">{k.value}</p>
              {k.sub && <p className="text-[11px] text-brand-muted">{k.sub}</p>}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h4 className="font-bold text-brand-navy mb-4">Pages les plus vues</h4>
          {data.topPages.length === 0 ? (
            <p className="text-sm text-brand-muted">Aucune donnée — les visiteurs doivent accepter les cookies.</p>
          ) : (
            <ul className="space-y-2.5">
              {data.topPages.map((p) => {
                const max = data.topPages[0].count;
                return (
                  <li key={p.path}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-mono text-brand-navy truncate">{p.path}</span>
                      <span className="text-brand-muted font-semibold">{p.count}</span>
                    </div>
                    <div className="h-1.5 bg-brand-soft rounded-full overflow-hidden">
                      <div className="h-full bg-brand-orange rounded-full" style={{ width: `${(p.count / max) * 100}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h4 className="font-bold text-brand-navy mb-4">Éléments les plus cliqués</h4>
          {data.topClicks.length === 0 ? (
            <p className="text-sm text-brand-muted">Aucune donnée pour l&apos;instant.</p>
          ) : (
            <ul className="space-y-2.5">
              {data.topClicks.map((c) => {
                const max = data.topClicks[0].count;
                return (
                  <li key={c.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-brand-navy truncate">{c.label}</span>
                      <span className="text-brand-muted font-semibold">{c.count}</span>
                    </div>
                    <div className="h-1.5 bg-brand-soft rounded-full overflow-hidden">
                      <div className="h-full bg-brand-navy rounded-full" style={{ width: `${(c.count / max) * 100}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h4 className="font-bold text-brand-navy mb-4">Parcours des visiteurs (sessions récentes)</h4>
        {data.sessions.length === 0 ? (
          <p className="text-sm text-brand-muted">Aucune session suivie.</p>
        ) : (
          <div className="space-y-2">
            {data.sessions.slice(0, 12).map((s) => (
              <div key={s.sid} className="flex flex-col md:flex-row md:items-center gap-1.5 md:gap-4 text-xs border-t border-gray-100 first:border-t-0 pt-2 first:pt-0">
                <span className="font-mono font-bold text-brand-navy w-20">{s.sid}…</span>
                <span className="text-brand-muted whitespace-nowrap">{s.events} événements</span>
                <span className="text-brand-muted flex-1 truncate" title={s.journey}>{s.journey || "—"}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h4 className="font-bold text-brand-navy mb-4">Activité récente</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[600px]">
            <thead>
              <tr className="bg-brand-soft/60 text-left text-brand-navy">
                <th className="px-4 py-2.5 font-semibold">Heure</th>
                <th className="px-4 py-2.5 font-semibold">Session</th>
                <th className="px-4 py-2.5 font-semibold">Type</th>
                <th className="px-4 py-2.5 font-semibold">Page / Élément</th>
              </tr>
            </thead>
            <tbody>
              {data.recent.map((e) => (
                <tr key={e.id} className="border-t border-gray-100">
                  <td className="px-4 py-2 text-brand-muted whitespace-nowrap">{new Date(e.createdAt).toLocaleString("fr-FR")}</td>
                  <td className="px-4 py-2 font-mono text-brand-navy">{e.sid}…</td>
                  <td className="px-4 py-2">
                    <span className="bg-brand-soft text-brand-navy px-2 py-0.5 rounded-full font-semibold">{e.kind}</span>
                  </td>
                  <td className="px-4 py-2 text-brand-muted font-mono">{e.path ?? e.label ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ============ Paiements (MaishaPay) ============ */

function PaymentsTab({ transactions }: { transactions: AdminPaymentTransaction[] }) {
  const [filter, setFilter] = useState<string>("all");

  const filtered = transactions.filter((t) => {
    if (filter === "completed") return t.status === "completed";
    if (filter === "pending") return t.status === "pending";
    if (filter === "failed") return t.status === "failed";
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-brand-orange" />
          <h3 className="font-bold text-brand-navy">Transactions MaishaPay (Sandbox)</h3>
          <span className="text-xs bg-brand-soft text-brand-navy px-2.5 py-0.5 rounded-full font-semibold">
            {transactions.length}
          </span>
        </div>
        <div className="flex gap-1.5 overflow-x-auto">
          {["all", "completed", "pending", "failed"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                filter === f
                  ? "bg-brand-navy text-white shadow-sm"
                  : "bg-brand-soft text-brand-muted hover:text-brand-navy"
              }`}
            >
              {f === "all" ? "Toutes" : f === "completed" ? "Validées" : f === "pending" ? "En attente" : "Échouées"}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-brand-muted">
            <CreditCard className="h-10 w-10 mx-auto mb-2 opacity-40" />
            <p>Aucune transaction enregistrée.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-brand-soft/60 text-left text-brand-navy text-xs">
                  <th className="px-5 py-3.5 font-semibold">Réf. Interne</th>
                  <th className="px-5 py-3.5 font-semibold">Type</th>
                  <th className="px-5 py-3.5 font-semibold">Passerelle</th>
                  <th className="px-5 py-3.5 font-semibold">Montant</th>
                  <th className="px-5 py-3.5 font-semibold">Réf. MaishaPay</th>
                  <th className="px-5 py-3.5 font-semibold">Réf. Opérateur</th>
                  <th className="px-5 py-3.5 font-semibold">Statut</th>
                  <th className="px-5 py-3.5 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((tx) => (
                  <tr key={tx.id} className="border-t border-gray-100 hover:bg-brand-soft/40 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs font-bold text-brand-navy">{tx.ref}</td>
                    <td className="px-5 py-3.5 capitalize text-xs">
                      <span className="px-2 py-0.5 rounded-full bg-brand-navy/10 text-brand-navy font-semibold">
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-brand-muted">
                      <span className="font-semibold text-brand-navy">MaishaPay</span> ({tx.gatewayMode})
                    </td>
                    <td className="px-5 py-3.5 font-bold text-brand-orange">{tx.amount} {tx.currency}</td>
                    <td className="px-5 py-3.5 font-mono text-xs text-brand-muted">{tx.transactionRef || "—"}</td>
                    <td className="px-5 py-3.5 font-mono text-xs text-brand-navy font-semibold">{tx.operatorRef || "—"}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                          tx.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : tx.status === "pending"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {tx.status === "completed" ? "Validé" : tx.status === "pending" ? "En attente" : "Échoué"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-brand-muted whitespace-nowrap">
                      {new Date(tx.createdAt).toLocaleString("fr-FR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
