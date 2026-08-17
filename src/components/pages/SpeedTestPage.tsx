"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gauge,
  Play,
  RotateCcw,
  ArrowDown,
  ArrowUp,
  Activity,
  Server,
  Globe,
  ShieldCheck,
  CheckCircle2,
  Share2,
  Tv,
  Gamepad2,
  Video,
  CloudUpload,
  Sparkles,
  ChevronRight,
  Wifi,
  Copy,
  Check,
} from "lucide-react";
import { useRouter } from "@/lib/router";
import {
  runSpeedTest,
  SpeedTestProgress,
  SpeedTestFinalResult,
} from "@/lib/speedtest";
import { PACKAGES } from "@/lib/content";

interface ServerOption {
  id: string;
  name: string;
  city: string;
  country: string;
  sponsor: string;
  flag: string;
}

export function SpeedTestPage() {
  const { navigate } = useRouter();
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState<SpeedTestProgress>({
    phase: "idle",
    pingMs: 0,
    jitterMs: 0,
    downloadMbps: 0,
    uploadMbps: 0,
    progressPercent: 0,
    downloadGraph: [],
    uploadGraph: [],
    currentSpeed: 0,
    server: "Liquid Home Kinshasa Core - Limete",
    clientIp: "197.234.218.42",
    isp: "Liquid Intelligent Technologies RDC",
  });
  const [result, setResult] = useState<SpeedTestFinalResult | null>(null);
  const [servers, setServers] = useState<ServerOption[]>([]);
  const [selectedServer, setSelectedServer] = useState<string>("kinshasa-core");
  const [history, setHistory] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);

  // Load server list and previous test history
  useEffect(() => {
    fetch("/api/speedtest/servers")
      .then((r) => r.json())
      .then((d) => {
        if (d.servers) setServers(d.servers);
      })
      .catch(() => {});

    fetch("/api/speedtest/results")
      .then((r) => r.json())
      .then((d) => {
        if (d.results) setHistory(d.results);
      })
      .catch(() => {});
  }, []);

  const handleStart = async () => {
    setRunning(true);
    setResult(null);
    setCopied(false);

    try {
      const finalResult = await runSpeedTest("/api/speedtest", (p) => {
        setProgress(p);
      });
      setResult(finalResult);
      // Refresh history
      fetch("/api/speedtest/results")
        .then((r) => r.json())
        .then((d) => {
          if (d.results) setHistory(d.results);
        })
        .catch(() => {});
    } catch (e) {
      console.error(e);
    } finally {
      setRunning(false);
    }
  };

  const handleShare = () => {
    if (!result) return;
    const text = `🚀 Mon test de débit Liquid Home RDC :\n⬇️ Téléchargement : ${result.downloadMbps} Mbps\n⬆️ Envoi : ${result.uploadMbps} Mbps\n⚡ Ping : ${result.ping} ms (Gigue : ${result.jitter} ms)\n📍 Serveur : ${result.server}\nTestez votre connexion fibre sur https://home.liquidrdc.tech/speedtest`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  // Convert speed (0 to 500+ Mbps) to needle angle (-120deg to +120deg)
  const calculateNeedleAngle = (speed: number) => {
    if (speed <= 0) return -120;
    // Logarithmic scale for smooth realistic feel across 1 to 500 Mbps
    const maxSpeed = 500;
    const clamped = Math.min(speed, maxSpeed);
    const fraction = Math.log10(clamped + 1) / Math.log10(maxSpeed + 1);
    return -120 + fraction * 240;
  };

  const needleAngle = calculateNeedleAngle(
    running ? progress.currentSpeed : result ? result.downloadMbps : 0
  );

  return (
    <div className="min-h-screen bg-[#070d1e] text-white selection:bg-brand-orange selection:text-white pb-20">
      {/* Glow / Background accents */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-[#273c88]/40 to-transparent rounded-full blur-[140px]" />
        <div className="absolute top-1/3 -left-40 w-96 h-96 bg-[#f89e3d]/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-[#00d2ff]/10 rounded-full blur-[120px]" />
      </div>

      {/* Header Banner */}
      <div className="relative pt-12 pb-6 px-4 max-w-6xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur text-brand-orange text-xs font-bold uppercase tracking-wider mb-4"
        >
          <Gauge className="h-4 w-4" />
          Test de Débit Fibre Optique Liquid Home
        </motion.div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-3">
          Mesurez la vitesse réelle de votre connexion
        </h1>
        <p className="text-gray-400 text-sm sm:text-base max-w-2xl mx-auto">
          Testez votre débit en temps réel avec nos serveurs à très faible latence connectés directement au cœur du réseau fibre Liquid Home RDC.
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-4 relative z-10">
        {/* Main Gauge Dashboard Container */}
        <div className="relative rounded-3xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/10 backdrop-blur-xl p-6 sm:p-10 shadow-2xl overflow-hidden mb-8">
          {/* Top Info Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-8 mb-8 border-b border-white/10">
            {/* Ping */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs text-gray-400 font-medium block">Latence (Ping)</span>
                <span className="text-lg font-bold font-mono text-white">
                  {progress.pingMs > 0 ? `${progress.pingMs} ms` : "—"}
                </span>
                {progress.jitterMs > 0 && (
                  <span className="text-[11px] text-gray-400 block font-mono">
                    Gigue: {progress.jitterMs} ms
                  </span>
                )}
              </div>
            </div>

            {/* Download */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex items-center gap-3">
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${progress.phase === "download" ? "bg-brand-orange/30 text-brand-orange border border-brand-orange animate-pulse" : "bg-brand-orange/20 text-brand-orange border border-brand-orange/30"}`}>
                <ArrowDown className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs text-gray-400 font-medium block">Téléchargement</span>
                <span className="text-lg font-bold font-mono text-brand-orange">
                  {progress.downloadMbps > 0 ? `${progress.downloadMbps} Mbps` : "—"}
                </span>
                <span className="text-[10px] text-gray-400 block">Download</span>
              </div>
            </div>

            {/* Upload */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex items-center gap-3">
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${progress.phase === "upload" ? "bg-emerald-500/30 text-emerald-400 border border-emerald-500 animate-pulse" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"}`}>
                <ArrowUp className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs text-gray-400 font-medium block">Envoi (Upload)</span>
                <span className="text-lg font-bold font-mono text-emerald-400">
                  {progress.uploadMbps > 0 ? `${progress.uploadMbps} Mbps` : "—"}
                </span>
                <span className="text-[10px] text-gray-400 block">Upload</span>
              </div>
            </div>

            {/* Server */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Server className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <span className="text-xs text-gray-400 font-medium block">Serveur</span>
                <span className="text-xs font-bold text-white truncate block" title={progress.server}>
                  Kinshasa Core
                </span>
                <span className="text-[10px] text-emerald-400 block font-semibold flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                  Direct Backbone
                </span>
              </div>
            </div>
          </div>

          {/* Central Animated Speedometer Gauge */}
          <div className="flex flex-col items-center justify-center relative py-6">
            <div className="relative w-72 h-72 sm:w-88 sm:h-88 flex items-center justify-center">
              {/* Outer SVG Dial */}
              <svg className="w-full h-full transform -rotate-90 overflow-visible" viewBox="0 0 200 200">
                {/* Dial background track */}
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="10"
                  fill="none"
                  strokeDasharray="377"
                  strokeDashoffset="126"
                  strokeLinecap="round"
                />

                {/* Live progress illuminated arc */}
                <motion.circle
                  cx="100"
                  cy="100"
                  r="80"
                  stroke="url(#speedGradient)"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray="377"
                  strokeDashoffset={377 - (progress.progressPercent / 100) * 251}
                  strokeLinecap="round"
                  style={{
                    filter: "drop-shadow(0 0 8px rgba(248,158,61,0.6))",
                  }}
                />

                <defs>
                  <linearGradient id="speedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00d2ff" />
                    <stop offset="50%" stopColor="#f89e3d" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Needle Indicator */}
              <div
                className="absolute inset-0 flex items-center justify-center transition-transform duration-150 ease-out"
                style={{
                  transform: `rotate(${needleAngle}deg)`,
                }}
              >
                <div className="w-1.5 h-36 bg-gradient-to-t from-transparent via-brand-orange to-white rounded-full shadow-[0_0_15px_#f89e3d] -translate-y-12" />
                <div className="absolute w-5 h-5 rounded-full bg-brand-navy border-2 border-brand-orange shadow-lg" />
              </div>

              {/* Center Hub Display / Start Button */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-auto">
                {!running && progress.phase === "idle" && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleStart}
                    className="w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-gradient-to-br from-brand-orange to-[#e28020] text-white font-extrabold flex flex-col items-center justify-center shadow-[0_0_40px_rgba(248,158,61,0.5)] border-4 border-white/20 group cursor-pointer transition-all"
                  >
                    <Play className="h-8 w-8 mb-1 fill-white ml-1 group-hover:scale-110 transition-transform" />
                    <span className="text-sm tracking-wider uppercase font-bold">LANCER LE TEST</span>
                    <span className="text-[10px] text-white/80 font-normal">Kinshasa 1 Gbps</span>
                  </motion.button>
                )}

                {running && (
                  <div className="flex flex-col items-center justify-center animate-in fade-in duration-300">
                    <span className="text-[11px] uppercase tracking-widest text-gray-400 font-semibold mb-1">
                      {progress.phase === "ping" && "Mesure Latence..."}
                      {progress.phase === "download" && "Téléchargement..."}
                      {progress.phase === "upload" && "Envoi (Upload)..."}
                    </span>
                    <div className="text-4xl sm:text-5xl font-extrabold font-mono text-white tracking-tight">
                      {progress.currentSpeed.toFixed(1)}
                    </div>
                    <span className="text-xs text-brand-orange font-bold uppercase tracking-wider mt-1">
                      Mbps
                    </span>
                    <div className="w-24 bg-white/10 h-1.5 rounded-full mt-3 overflow-hidden">
                      <div
                        className="bg-brand-orange h-full rounded-full transition-all duration-100"
                        style={{ width: `${progress.progressPercent}%` }}
                      />
                    </div>
                  </div>
                )}

                {!running && progress.phase === "finished" && (
                  <div className="flex flex-col items-center justify-center animate-in zoom-in duration-300">
                    <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold mb-0.5">
                      RÉSULTAT FINAL
                    </span>
                    <div className="text-4xl sm:text-5xl font-extrabold font-mono text-white">
                      {result?.downloadMbps ?? progress.downloadMbps}
                    </div>
                    <span className="text-xs text-gray-300 font-bold uppercase tracking-wider">
                      Mbps Download
                    </span>
                    <button
                      onClick={handleStart}
                      className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold transition-colors"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Refaire le test
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Status / ISP info */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-gray-400">
              <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                <Globe className="h-3.5 w-3.5 text-blue-400" />
                <span>Fournisseur : <strong className="text-white">{progress.isp}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>IP Client : <strong className="text-white font-mono">{progress.clientIp}</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Results & Diagnostics Section (When Finished) */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6 mb-12"
            >
              {/* Rating Card */}
              <div className="bg-gradient-to-r from-[#002d62] via-[#102a6b] to-[#273c88] rounded-3xl p-6 sm:p-8 border border-blue-400/30 shadow-2xl relative overflow-hidden">
                <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-brand-orange/20 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Certificat de Test Réseau
                      </span>
                      <span className="text-xs text-blue-200">
                        {new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                      {result.ratingLabel}
                    </h2>
                    <p className="text-blue-100/80 text-sm mt-1">
                      Votre débit mesuré permet d&apos;exploiter pleinement tous vos usages numériques en simultané.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleShare}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-colors"
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4 text-emerald-400" />
                          Copié !
                        </>
                      ) : (
                        <>
                          <Share2 className="h-4 w-4" />
                          Partager mon score
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => navigate("/souscrire")}
                      className="btn-brand text-xs px-5 py-2.5 flex items-center gap-2 shadow-lg shadow-brand-orange/30"
                    >
                      <Sparkles className="h-4 w-4" />
                      Booster mon forfait
                    </button>
                  </div>
                </div>

                {/* Diagnostics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10">
                  <div className="bg-white/5 rounded-xl p-3.5 border border-white/5">
                    <div className="flex items-center gap-2 text-white text-xs font-bold mb-1">
                      <Tv className="h-4 w-4 text-brand-orange" />
                      Streaming 4K / 8K
                    </div>
                    <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Ultra fluide sans coupure
                    </span>
                  </div>

                  <div className="bg-white/5 rounded-xl p-3.5 border border-white/5">
                    <div className="flex items-center gap-2 text-white text-xs font-bold mb-1">
                      <Gamepad2 className="h-4 w-4 text-blue-400" />
                      Gaming en Ligne
                    </div>
                    <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Faible latence &lt; 30ms
                    </span>
                  </div>

                  <div className="bg-white/5 rounded-xl p-3.5 border border-white/5">
                    <div className="flex items-center gap-2 text-white text-xs font-bold mb-1">
                      <Video className="h-4 w-4 text-purple-400" />
                      Visioconférence HD
                    </div>
                    <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Qualité Zoom / Teams HD
                    </span>
                  </div>

                  <div className="bg-white/5 rounded-xl p-3.5 border border-white/5">
                    <div className="flex items-center gap-2 text-white text-xs font-bold mb-1">
                      <CloudUpload className="h-4 w-4 text-emerald-400" />
                      Envois & Cloud
                    </div>
                    <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Upload ultra rapide
                    </span>
                  </div>
                </div>
              </div>

              {/* Recommended Liquid Home Plan Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 text-brand-navy shadow-xl border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-orange block mb-1">
                    Offre Recommandée pour votre usage
                  </span>
                  <h3 className="text-2xl font-black text-brand-navy">
                    Forfait {result.matchedPlan.name} ({result.matchedPlan.speed})
                  </h3>
                  <p className="text-sm text-brand-muted mt-1 max-w-xl">
                    Profitez d&apos;une fibre 100% dédiée avec débit garanti, volume illimité, sans bridage et installation prioritaire à Kinshasa.
                  </p>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-right">
                    <span className="text-xs text-brand-muted block">Tarif mensuel</span>
                    <span className="text-3xl font-black text-brand-orange">{result.matchedPlan.price} $</span>
                    <span className="text-xs text-brand-muted block">/mois</span>
                  </div>
                  <button
                    onClick={() => navigate(`/souscrire?package=${result.matchedPlan.slug}`)}
                    className="btn-brand px-6 py-3 text-sm flex items-center gap-2 shadow-lg shadow-brand-orange/30 font-bold"
                  >
                    Souscrire maintenant
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* History Table */}
        {history.length > 0 && (
          <div className="bg-white/5 rounded-3xl p-6 border border-white/10 backdrop-blur-lg">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-brand-orange" />
              Historique récent des tests de débit
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="text-gray-400 border-b border-white/10">
                    <th className="pb-3 font-semibold">Date & Heure</th>
                    <th className="pb-3 font-semibold">Download</th>
                    <th className="pb-3 font-semibold">Upload</th>
                    <th className="pb-3 font-semibold">Ping / Gigue</th>
                    <th className="pb-3 font-semibold">Serveur</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono">
                  {history.slice(0, 5).map((h) => (
                    <tr key={h.id} className="text-gray-300 hover:bg-white/5 transition-colors">
                      <td className="py-3 text-gray-400 font-sans">
                        {new Date(h.createdAt).toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="py-3 font-bold text-brand-orange">
                        {h.downloadMbps} Mbps
                      </td>
                      <td className="py-3 font-bold text-emerald-400">
                        {h.uploadMbps} Mbps
                      </td>
                      <td className="py-3">
                        {h.ping} ms <span className="text-gray-500">({h.jitter} ms)</span>
                      </td>
                      <td className="py-3 text-gray-400 font-sans truncate max-w-xs">
                        {h.server}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
