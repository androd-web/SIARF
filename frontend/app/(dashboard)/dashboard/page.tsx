/* eslint-disable react/jsx-no-undef */
"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// ─── Types ───────────────────────────────────────────────────────────────────
type RiskLevel = "Critique" | "Élevé" | "Moyen";
type DSStatus = "Analyse Req." | "Soumis ANIF" | "Classé";
type SysStatus = "OK" | "WARN" | "ERR";

interface Alert {
  id: string;
  level: RiskLevel;
  title: string;
  description: string;
  rule: string;
  score: number;
  time: string;
  isNew?: boolean;
}

interface DSRecord {
  ref: string;
  entity: string;
  volume: number;
  status: DSStatus;
  date: string;
}

interface SysService {
  name: string;
  detail: string;
  status: SysStatus;
}

// ─── Données initiales ───────────────────────────────────────────────────────
const INITIAL_ALERTS: Alert[] = [
  {
    id: "1",
    level: "Critique",
    title: "Virement atypique international",
    description:
      "Cpt #CM21-4589-22 — Transfert sortant vers juridiction Liste Grise GAFI.",
    rule: "AML-R04",
    score: 94,
    time: "14:20:12",
  },
  {
    id: "2",
    level: "Élevé",
    title: "Suspicion Smurfing (Espèces)",
    description:
      "Agence Akwa — 4 dépôts successifs sous le seuil déclaratif (5M FCFA).",
    rule: "AML-R12",
    score: 82,
    time: "13:45:01",
  },
  {
    id: "3",
    level: "Moyen",
    title: "Activité inhabituelle compte dormant",
    description:
      "Compte inactif 18 mois — 3 retraits en 24h totalisant 9,2M FCFA.",
    rule: "AML-R07",
    score: 67,
    time: "12:30:44",
  },
  {
    id: "4",
    level: "Élevé",
    title: "Bénéficiaire liste sanctions OFAC",
    description: "Correspondance partielle 94% — Entité MBEKI Holdings Ltd.",
    rule: "SCR-R02",
    score: 88,
    time: "11:15:22",
  },
  {
    id: "5",
    level: "Moyen",
    title: "Structuration dépôts espèces",
    description: "Agence Bali — Fragmentation opérations sur 72h.",
    rule: "AML-R15",
    score: 71,
    time: "10:05:09",
  },
];

const DS_RECORDS: DSRecord[] = [
  {
    ref: "DS-2026-089",
    entity: "Entreprise Bamiléké SA",
    volume: 45500000,
    status: "Analyse Req.",
    date: "02/07 14:10",
  },
  {
    ref: "DS-2026-088",
    entity: "Jean-Paul Essomba",
    volume: 12250000,
    status: "Soumis ANIF",
    date: "01/07 09:45",
  },
  {
    ref: "DS-2026-087",
    entity: "Sarl Douala Logistics",
    volume: 150000000,
    status: "Soumis ANIF",
    date: "30/06 16:20",
  },
  {
    ref: "DS-2026-086",
    entity: "NGO Espoir Yaoundé",
    volume: 8700000,
    status: "Classé",
    date: "28/06 11:05",
  },
  {
    ref: "DS-2026-085",
    entity: "Ibrahim Trading Co.",
    volume: 32100000,
    status: "Analyse Req.",
    date: "27/06 08:30",
  },
];

const SYS_SERVICES: SysService[] = [
  { name: "CORE_BANKING_API", detail: "Ping: 24ms | Loss: 0%", status: "OK" },
  { name: "AML_RULES_ENGINE", detail: "v1.0.0-MVP | CPU: 12%", status: "OK" },
  {
    name: "NAME_SCREENING_NLP",
    detail: "Queue: 4 req | Mem: 42%",
    status: "WARN",
  },
  { name: "ANIF_GATEWAY", detail: "Last sync: T-120s", status: "OK" },
];

// Données graphique 7 jours
const generateChartData = () => {
  const days = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
  return days.map((day) => ({
    day,
    transactions: Math.floor(1600 + Math.random() * 600),
    alertes: Math.floor(18 + Math.random() * 25),
    ds: Math.floor(8 + Math.random() * 15),
  }));
};

// ─── Helpers UI ──────────────────────────────────────────────────────────────
function formatVolume(n: number) {
  return new Intl.NumberFormat("fr-FR").format(n);
}

function RiskPill({ level }: { level: RiskLevel }) {
  const styles: Record<RiskLevel, string> = {
    Critique: "bg-[#ba1a1a]/10 text-[#ba1a1a]",
    Élevé: "bg-[#960DF2]/10 text-[#960DF2]",
    Moyen: "bg-amber-100 text-amber-700",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${styles[level]}`}
    >
      {level}
    </span>
  );
}

function StatusPill({ status }: { status: DSStatus }) {
  const map: Record<DSStatus, { bg: string; text: string }> = {
    "Analyse Req.": { bg: "#960DF2", text: "white" },
    "Soumis ANIF": { bg: "#10B981", text: "white" },
    Classé: { bg: "#7d7481", text: "white" },
  };
  const s = map[status];
  return (
    <span
      className="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
      style={{ background: s.bg, color: s.text }}
    >
      {status}
    </span>
  );
}

function SysStatusBadge({ status }: { status: SysStatus }) {
  if (status === "OK")
    return (
      <div className="flex items-center gap-2 font-black tracking-widest text-[11px] text-[#10B981]">
        <span className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse" />
        OK
      </div>
    );
  if (status === "WARN")
    return (
      <div className="flex items-center gap-2 font-black tracking-widest text-[11px] text-[#960DF2]">
        <span className="w-2.5 h-2.5 bg-[#960DF2] rounded-full shadow-[0_0_8px_rgba(150,13,242,0.6)]" />
        WARN
      </div>
    );
  return (
    <div className="flex items-center gap-2 font-black tracking-widest text-[11px] text-[#ba1a1a]">
      <span className="w-2 h-2 bg-[#ba1a1a] rounded-full" />
      ERR
    </div>
  );
}

// ─── Composant Sidebar ───────────────────────────────────────────────────────
function Sidebar({ active }: { active: string }) {
  const navItems = [
    {
      label: "Tableau de bord",
      icon: "dashboard",
      href: "/dashboard",
      section: "surveillance",
    },
    {
      label: "Alertes Transactions",
      icon: "monitoring",
      href: "/alertes",
      section: "surveillance",
    },
    {
      label: "Déclarations Soupçon",
      icon: "gavel",
      href: "/declarations",
      section: "surveillance",
    },
    {
      label: "Filtrage Entités",
      icon: "person_search",
      href: "/entites",
      section: "surveillance",
    },
    {
      label: "Journal Audit",
      icon: "receipt_long",
      href: "/audit",
      section: "systeme",
    },
    {
      label: "État Système",
      icon: "dns",
      href: "/systeme",
      section: "systeme",
    },
  ];

  return (
    <aside
      className="shrink-0 w-60 border-r z-50"
      style={{ background: "#3C0561", borderColor: "#2e004e" }}
    >
      {/* Brand */}
      <div
        className="h-16 flex items-center px-6 border-b"
        style={{ borderColor: "#2e004e" }}
      >
        <div className="flex h-12 w-12 items-center gap-3">
          <Image
            src="/image/logoSIARF.png"
            alt="Logo SIARF"
            width={180}
            height={180}
            className="object-contain"
          />
          <div className="flex flex-col">
            <span className="text-xs font-bold text-white tracking-widest uppercase">
              SIARF
            </span>
            <span className="text-[10px] text-white/50 tracking-wider uppercase font-medium">
              Compliance Div
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-8">
        <div className="px-6 mb-3">
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">
            Surveillance
          </span>
        </div>
        <div className="space-y-0.5">
          {navItems
            .filter((i) => i.section === "surveillance")
            .map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-4 px-6 py-2.5 text-xs font-medium tracking-wide transition-all group ${
                  active === item.href
                    ? "text-white border-l-4 border-white"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
                style={active === item.href ? { background: "#960DF2" } : {}}
              >
                <span
                  className="material-symbols-outlined text-[18px] group-hover:text-[#960DF2]"
                  style={active === item.href ? { color: "white" } : {}}
                >
                  {item.icon}
                </span>
                {item.label}
              </Link>
            ))}
        </div>

        <div className="px-6 mb-3 mt-10">
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">
            Système
          </span>
        </div>
        <div className="space-y-0.5">
          {navItems
            .filter((i) => i.section === "systeme")
            .map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-4 px-6 py-2.5 text-xs font-medium tracking-wide text-white/60 hover:text-white hover:bg-white/5 transition-all group"
              >
                <span className="material-symbols-outlined text-[18px] group-hover:text-[#960DF2]">
                  {item.icon}
                </span>
                {item.label}
              </Link>
            ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-5 border-t" style={{ borderColor: "#2e004e" }}>
        <button
          className="w-full flex items-center justify-center gap-2 h-9 rounded text-white font-bold text-[11px] uppercase tracking-wider mb-4 transition-all hover:brightness-110"
          style={{ background: "#960DF2" }}
        >
          <span className="material-symbols-outlined text-[15px]">add</span>
          Nouv. Déclaration
        </button>
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded flex items-center justify-center text-white font-bold text-sm shrink-0"
            style={{
              background: "#2e004e",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            JM
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">J. Mbida</p>
            <p className="text-[10px] text-white/50 truncate uppercase tracking-wider font-semibold">
              Officier Conformité
            </p>
          </div>
          <button className="text-white/40 hover:text-white transition-colors">
            <span className="material-symbols-outlined text-[18px]">
              logout
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
}

// ─── Composant Topbar ─────────────────────────────────────────────────────────
function Topbar({ alertCount }: { alertCount: number }) {
  const [time, setTime] = useState("");

  useEffect(() => {
    const tick = () => {
      setTime(
        new Date()
          .toLocaleString("fr-FR", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            timeZone: "UTC",
          })
          .toUpperCase() + " UTC",
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header
      className="bg-white h-16 px-8 flex justify-between items-center border-b shrink-0 shadow-sm"
      style={{ borderColor: "#f0edee", zIndex: 40 }}
    >
      <div>
        <h2
          className="text-lg font-bold tracking-tight"
          style={{ color: "#1b1b1c" }}
        >
          Vue d&apos;ensemble SIARF
        </h2>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs font-medium" style={{ color: "#7d7481" }}>
            Afriland First Bank
          </span>
          <span
            className="w-1 h-1 rounded-full"
            style={{ background: "#cec3d1" }}
          />
          <span className="text-xs font-medium" style={{ color: "#7d7481" }}>
            Surveillance Temps Réel
          </span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Statut système */}
        <div
          className="flex items-center gap-2 px-4 py-1.5 rounded-full border"
          style={{
            background: "rgba(16,185,129,0.05)",
            borderColor: "rgba(16,185,129,0.2)",
          }}
        >
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#10B981]">
            Sys Opérationnel
          </span>
        </div>

        {/* Horloge temps réel */}
        <div className="flex items-center gap-2">
          <span
            className="material-symbols-outlined text-[16px]"
            style={{ color: "#7d7481" }}
          >
            schedule
          </span>
          <span
            className="text-xs font-semibold tracking-wide font-mono"
            style={{ color: "#1b1b1c", minWidth: 220 }}
          >
            {time}
          </span>
        </div>

        {/* Actions */}
        <div
          className="flex items-center gap-3 pl-6 border-l"
          style={{ borderColor: "#f0edee" }}
        >
          <button
            className="relative transition-colors"
            style={{ color: "#7d7481" }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.color =
                "var(--siarf-400)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.color = "#7d7481")
            }
          >
            <span className="material-symbols-outlined text-[22px]">
              notifications
            </span>
            {alertCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#ba1a1a] rounded-full border-2 border-white flex items-center justify-center text-[9px] text-white font-bold">
                {alertCount > 9 ? "9+" : alertCount}
              </span>
            )}
          </button>

          <button
            className="transition-colors"
            style={{ color: "#7d7481" }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.color =
                "var(--siarf-400)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.color = "#7d7481")
            }
          >
            <span className="material-symbols-outlined text-[22px]">
              settings
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}

// ─── Composant KPI Card ───────────────────────────────────────────────────────
// ─── Composant KPI Card ───────────────────────────────────────────────────────
function KpiCard({
  label,
  value,
  sub,
  subColor,
  icon,
  accentColor,
  borderLeft,
}: {
  label: string;
  value: string | number;
  sub: React.ReactNode;
  subColor?: string;
  icon: string;
  accentColor: string;
  borderLeft?: string;
}) {
  return (
    <div
      className="bg-white p-6 rounded transition-transform hover:scale-[1.01] cursor-default"
      style={{
        border: "1px solid #f0edee",
        borderLeft: borderLeft
          ? `4px solid ${borderLeft}`
          : "1px solid #f0edee",
      }}
    >
      <div className="flex justify-between items-start mb-6">
        <span
          className="text-[10px] font-bold uppercase tracking-[0.15em]"
          style={{ color: "#7d7481" }}
        >
          {label}
        </span>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{
            background: `${accentColor}0d`,
            border: `1px solid ${accentColor}1a`,
          }}
        >
          <span
            className="material-symbols-outlined text-[18px]"
            style={{ color: accentColor }}
          >
            {icon}
          </span>
        </div>
      </div>
      <div
        className="text-3xl font-bold tracking-tight mb-2"
        style={{ color: "#1b1b1c" }}
      >
        {value}
      </div>
      <div className="text-xs" style={{ color: subColor ?? "#7d7481" }}>
        {sub}
      </div>
    </div>
  );
}
// ─── Composant Alert Card ─────────────────────────────────────────────────────
function AlertCard({ alert, isNew }: { alert: Alert; isNew?: boolean }) {
  const borderColor =
    alert.level === "Critique"
      ? "#ba1a1a"
      : alert.level === "Élevé"
        ? "#960DF2"
        : "#D97706";
  const scoreColor =
    alert.level === "Critique"
      ? "#ba1a1a"
      : alert.level === "Élevé"
        ? "#960DF2"
        : "#D97706";

  return (
    <div
      className={`p-4 rounded bg-white cursor-pointer group transition-all hover:shadow-md ${isNew ? "animate-pulse-once" : ""}`}
      style={{
        border: "1px solid #f0edee",
        borderLeft: `4px solid ${borderColor}`,
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      <div className="flex justify-between items-center mb-2">
        <RiskPill level={alert.level} />
        <span
          className="text-[10px] font-bold tracking-tighter"
          style={{ color: "#7d7481" }}
        >
          {alert.time}
        </span>
      </div>
      <div
        className="text-sm font-bold mb-1 transition-colors group-hover:text-[#960DF2]"
        style={{ color: "#1b1b1c" }}
      >
        {alert.title}
      </div>
      <div
        className="text-xs leading-relaxed mb-3 line-clamp-2"
        style={{ color: "#7d7481" }}
      >
        {alert.description}
      </div>
      <div
        className="flex justify-between items-center pt-3 border-t"
        style={{ borderColor: "#f0edee" }}
      >
        <span
          className="text-[10px] font-bold tracking-wide"
          style={{ color: "#7d7481" }}
        >
          Règle: {alert.rule}
        </span>
        <span
          className="text-[10px] font-bold uppercase"
          style={{ color: "#1b1b1c" }}
        >
          Score:{" "}
          <span
            className="font-extrabold text-xs"
            style={{ color: scoreColor }}
          >
            {alert.score}
          </span>
        </span>
      </div>
    </div>
  );
}

// ─── Tooltip graphique ────────────────────────────────────────────────────────
function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="bg-white border rounded shadow-lg p-3 text-xs"
      style={{ borderColor: "#cec3d1" }}
    >
      <p
        className="font-bold mb-2 uppercase tracking-wider"
        style={{ color: "#1b1b1c" }}
      >
        {label}
      </p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 mb-1">
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: p.color }}
          />
          <span style={{ color: "#7d7481" }}>{p.name}:</span>
          <span className="font-bold" style={{ color: "#1b1b1c" }}>
            {p.value.toLocaleString("fr-FR")}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Page Dashboard ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [alerts, setAlerts] = useState<Alert[]>(INITIAL_ALERTS);
  const [chartData] = useState(generateChartData());
  const [dsSearch, setDsSearch] = useState("");
  const [dsFilter, setDsFilter] = useState<DSStatus | "Tous">("Tous");
  const [metrics, setMetrics] = useState({
    volume: 12847,
    critiques: 23,
    attente: 7,
    transmissions: 142,
  });

  const [realStats, setRealStats] = useState<{
    transactions: {
      total: number;
      critique: number;
      surveillance: number;
      normal: number;
    };
    alertes: {
      total: number;
      en_attente: number;
      en_cours: number;
      traitees: number;
    };
    declarations: { total: number; transmises: number };
    score_aml_moyen: number;
    banque: string;
  } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("siarf_token");
    if (!token) return;
    fetch("http://localhost:8000/api/v1/dashboard/stats", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setRealStats(data))
      .catch(console.error);
  }, []);

  // Simulation flux alertes temps réel
  const addAlert = useCallback(() => {
    const pool = [
      {
        level: "Critique" as RiskLevel,
        title: "Transaction suspecte détectée",
        description: "Flux entrant non identifié — compte PEP.",
        rule: "AML-R09",
        score: 91,
      },
      {
        level: "Élevé" as RiskLevel,
        title: "Tentative de blanchiment par immobilier",
        description: "Achat cash immobilier > 50M FCFA sans justificatif.",
        rule: "AML-R18",
        score: 79,
      },
      {
        level: "Moyen" as RiskLevel,
        title: "Virements fractionnés suspects",
        description: "Série de 6 virements < seuil déclaratif en 48h.",
        rule: "AML-R11",
        score: 64,
      },
    ];
    const src = pool[Math.floor(Math.random() * pool.length)];
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
    const newAlert: Alert = {
      ...src,
      id: Date.now().toString(),
      time,
      isNew: true,
    };

    setAlerts((prev) => [newAlert, ...prev.slice(0, 7)]);
    setMetrics((m) => ({
      ...m,
      volume: m.volume + Math.floor(Math.random() * 50),
      critiques: src.level === "Critique" ? m.critiques + 1 : m.critiques,
    }));
  }, []);

  useEffect(() => {
    const id = setInterval(addAlert, 18000); // nouvelle alerte toutes les 18s
    return () => clearInterval(id);
  }, [addAlert]);

  // Filtrage DS
  const filteredDS = DS_RECORDS.filter((d) => {
    const matchSearch =
      d.ref.toLowerCase().includes(dsSearch.toLowerCase()) ||
      d.entity.toLowerCase().includes(dsSearch.toLowerCase());
    const matchFilter = dsFilter === "Tous" || d.status === dsFilter;
    return matchSearch && matchFilter;
  });

  const critiquesCount = alerts.filter((a) => a.level === "Critique").length;

  return (
    <div
      className="h-screen w-screen flex overflow-hidden font-sans"
      style={{ background: "#fcf8f9", color: "#1b1b1c" }}
    >
      <Sidebar active="/dashboard" />

      <div className="flex-1 flex flex-col min-w-0 relative">
        <Topbar alertCount={critiquesCount} />

        {/* Canvas scrollable */}
        <main
          className="flex-1 overflow-y-auto p-8"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "#ab78d1 transparent",
          }}
        >
          <div className="max-w-[1600px] mx-auto space-y-6">
            {/* ── Ligne 1 : KPIs ──────────────────────────────────────── */}
            <div className="grid grid-cols-4 gap-6">
              <KpiCard
                label="Volume Transactionnel (24H)"
                value={
                  realStats?.transactions.total.toLocaleString("fr-FR") ??
                  metrics.volume.toLocaleString("fr-FR")
                }
                sub={
                  <span className="flex items-center gap-1.5">
                    <span className="bg-[#10B981]/10 text-[#10B981] px-1.5 py-0.5 rounded flex items-center font-bold">
                      <span className="material-symbols-outlined text-[14px]">
                        arrow_upward
                      </span>{" "}
                      2.4%
                    </span>
                    <span>vs p. préc.</span>
                  </span>
                }
                icon="stacked_line_chart"
                accentColor="#960DF2"
              />
              <KpiCard
                label="Alertes Critiques Actives"
                value={realStats?.alertes.en_attente ?? metrics.critiques}
                sub={
                  <span className="flex items-center gap-1.5">
                    <span className="bg-[#ba1a1a]/10 text-[#ba1a1a] px-1.5 py-0.5 rounded flex items-center font-bold">
                      <span className="material-symbols-outlined text-[14px]">
                        arrow_upward
                      </span>{" "}
                      5
                    </span>
                    <span>depuis 1h</span>
                  </span>
                }
                icon="priority_high"
                accentColor="#ba1a1a"
                borderLeft="#ba1a1a"
              />
              <KpiCard
                label="Dossiers en Attente (DS)"
                value={realStats?.declarations.total ?? metrics.attente}
                sub={
                  <span className="font-bold uppercase text-[#960DF2]">
                    Action requise imméd.
                  </span>
                }
                icon="pending"
                accentColor="#960DF2"
              />
              <KpiCard
                label="Transmissions ANIF"
                value={
                  realStats?.declarations.transmises ?? metrics.transmissions
                }
                sub="Mois courant (MTD)"
                icon="check_circle"
                accentColor="#10B981"
              />
            </div>

            {/* ── Ligne 2 : Graphique + Flux Alertes ──────────────────── */}
            <div className="grid grid-cols-12 gap-6">
              {/* Graphique */}
              <div
                className="col-span-8 bg-white rounded flex flex-col h-105"
                style={{ border: "1px solid #f0edee" }}
              >
                <div
                  className="flex items-center justify-between p-5 border-b"
                  style={{
                    borderColor: "#f0edee",
                    background: "rgba(240,237,238,0.3)",
                  }}
                >
                  <div>
                    <h3
                      className="text-sm font-bold"
                      style={{ color: "#1b1b1c" }}
                    >
                      Analyse des Flux SIARF
                    </h3>
                    <p
                      className="text-[10px] font-bold uppercase tracking-widest mt-0.5"
                      style={{ color: "#7d7481" }}
                    >
                      Transactions vs Alertes (7 Jours)
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {["CSV", "PDF"].map((f) => (
                      <button
                        key={f}
                        className="px-4 py-1.5 border rounded text-xs font-bold transition-all hover:bg-gray-50"
                        style={{ borderColor: "#cec3d1", color: "#1b1b1c" }}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex-1 p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={chartData}
                      margin={{ top: 8, right: 8, left: -10, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="gTx" x1="0" y1="0" x2="0" y2="1">
                          <stop
                            offset="5%"
                            stopColor="#960DF2"
                            stopOpacity={0.15}
                          />
                          <stop
                            offset="95%"
                            stopColor="#960DF2"
                            stopOpacity={0}
                          />
                        </linearGradient>
                        <linearGradient id="gAl" x1="0" y1="0" x2="0" y2="1">
                          <stop
                            offset="5%"
                            stopColor="#ba1a1a"
                            stopOpacity={0.15}
                          />
                          <stop
                            offset="95%"
                            stopColor="#ba1a1a"
                            stopOpacity={0}
                          />
                        </linearGradient>
                        <linearGradient id="gDs" x1="0" y1="0" x2="0" y2="1">
                          <stop
                            offset="5%"
                            stopColor="#10B981"
                            stopOpacity={0.15}
                          />
                          <stop
                            offset="95%"
                            stopColor="#10B981"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0edee" />
                      <XAxis
                        dataKey="day"
                        tick={{
                          fontSize: 11,
                          fill: "#7d7481",
                          fontWeight: 600,
                        }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: "#7d7481" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip content={<ChartTooltip />} />
                      <Legend
                        wrapperStyle={{
                          fontSize: 11,
                          fontWeight: 700,
                          paddingTop: 8,
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="transactions"
                        name="Transactions"
                        stroke="#960DF2"
                        strokeWidth={2}
                        fill="url(#gTx)"
                        dot={false}
                        activeDot={{ r: 4, fill: "#960DF2" }}
                      />
                      <Area
                        type="monotone"
                        dataKey="alertes"
                        name="Alertes"
                        stroke="#ba1a1a"
                        strokeWidth={2}
                        fill="url(#gAl)"
                        dot={false}
                        activeDot={{ r: 4, fill: "#ba1a1a" }}
                      />
                      <Area
                        type="monotone"
                        dataKey="ds"
                        name="DS"
                        stroke="#10B981"
                        strokeWidth={2}
                        fill="url(#gDs)"
                        dot={false}
                        activeDot={{ r: 4, fill: "#10B981" }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Flux Alertes temps réel */}
              <div
                className="col-span-4 bg-white rounded flex flex-col h-105"
                style={{ border: "1px solid #f0edee" }}
              >
                <div
                  className="flex items-center justify-between p-5 border-b shrink-0"
                  style={{
                    borderColor: "#f0edee",
                    background: "rgba(240,237,238,0.3)",
                  }}
                >
                  <div>
                    <h3
                      className="text-sm font-bold"
                      style={{ color: "#1b1b1c" }}
                    >
                      Flux d&apos;Alertes TR
                    </h3>
                    <p
                      className="text-[10px] font-bold uppercase tracking-widest mt-0.5"
                      style={{ color: "#7d7481" }}
                    >
                      Surveillance Continue SIARF
                    </p>
                  </div>
                  <button
                    className="text-xs font-bold hover:underline"
                    style={{ color: "#960DF2" }}
                  >
                    Registre →
                  </button>
                </div>
                <div
                  className="flex-1 overflow-y-auto p-4 space-y-3"
                  style={{
                    scrollbarWidth: "thin",
                    scrollbarColor: "#ab78d1 transparent",
                  }}
                >
                  {alerts.map((a) => (
                    <AlertCard key={a.id} alert={a} isNew={a.isNew} />
                  ))}
                </div>
              </div>
            </div>

            {/* ── Ligne 3 : Table DS + Diagnostic ────────────────────── */}
            <div className="grid grid-cols-12 gap-6 pb-8">
              {/* Table DS */}
              <div
                className="col-span-8 bg-white rounded flex flex-col"
                style={{ border: "1px solid #f0edee" }}
              >
                <div
                  className="p-5 border-b flex items-center justify-between"
                  style={{
                    borderColor: "#f0edee",
                    background: "rgba(240,237,238,0.3)",
                  }}
                >
                  <div>
                    <h3
                      className="text-sm font-bold"
                      style={{ color: "#1b1b1c" }}
                    >
                      Déclarations de Soupçon (DS)
                    </h3>
                    <p
                      className="text-[10px] font-bold uppercase tracking-widest mt-0.5"
                      style={{ color: "#7d7481" }}
                    >
                      Dossiers Récents SIARF
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Recherche */}
                    <div className="relative">
                      <span
                        className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[16px]"
                        style={{ color: "#7d7481" }}
                      >
                        search
                      </span>
                      <input
                        value={dsSearch}
                        onChange={(e) => setDsSearch(e.target.value)}
                        placeholder="Rechercher..."
                        className="h-9 pl-9 pr-4 text-xs border rounded outline-none transition-all w-44"
                        style={{
                          borderColor: "#cec3d1",
                          color: "#1b1b1c",
                          background: "white",
                        }}
                        onFocus={(e) =>
                          (e.target.style.borderColor = "#960DF2")
                        }
                        onBlur={(e) => (e.target.style.borderColor = "#cec3d1")}
                      />
                    </div>
                    {/* Filtre statut */}
                    <select
                      value={dsFilter}
                      onChange={(e) =>
                        setDsFilter(e.target.value as DSStatus | "Tous")
                      }
                      className="h-9 px-3 text-xs border rounded outline-none cursor-pointer font-bold"
                      style={{
                        borderColor: "#cec3d1",
                        color: "#1b1b1c",
                        background: "white",
                      }}
                    >
                      <option value="Tous">Tous</option>
                      <option value="Analyse Req.">Analyse Req.</option>
                      <option value="Soumis ANIF">Soumis ANIF</option>
                      <option value="Classé">Classé</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr
                        className="border-b-2"
                        style={{ borderColor: "#f0edee" }}
                      >
                        {[
                          "Réf ID",
                          "Sujet / Entité",
                          "Volume (XAF)",
                          "Statut",
                          "Horodatage",
                        ].map((h, i) => (
                          <th
                            key={h}
                            className={`py-4 px-5 text-[10px] font-bold uppercase tracking-[0.15em] whitespace-nowrap ${i === 2 || i === 4 ? "text-right" : ""}`}
                            style={{ color: "#1b1b1c" }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDS.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="py-12 text-center text-xs font-bold uppercase tracking-widest"
                            style={{ color: "#7d7481" }}
                          >
                            Aucun résultat trouvé
                          </td>
                        </tr>
                      ) : (
                        filteredDS.map((d, i) => (
                          <tr
                            key={d.ref}
                            className="cursor-pointer group transition-colors"
                            style={{
                              borderTop:
                                i > 0 ? "1px solid #f0edee" : undefined,
                            }}
                            onMouseEnter={(e) =>
                              ((
                                e.currentTarget as HTMLTableRowElement
                              ).style.background = "#f6f4fb")
                            }
                            onMouseLeave={(e) =>
                              ((
                                e.currentTarget as HTMLTableRowElement
                              ).style.background = "")
                            }
                          >
                            <td
                              className="py-4 px-5 font-mono font-bold text-xs group-hover:underline whitespace-nowrap"
                              style={{ color: "#960DF2" }}
                            >
                              {d.ref}
                            </td>
                            <td
                              className="py-4 px-5 font-bold text-xs whitespace-nowrap"
                              style={{ color: "#1b1b1c" }}
                            >
                              {d.entity}
                            </td>
                            <td
                              className="py-4 px-5 text-right font-mono font-bold text-xs whitespace-nowrap"
                              style={{ color: "#1b1b1c" }}
                            >
                              {formatVolume(d.volume)}
                            </td>
                            <td className="py-4 px-5 whitespace-nowrap">
                              <StatusPill status={d.status} />
                            </td>
                            <td
                              className="py-4 px-5 text-right text-xs font-bold whitespace-nowrap"
                              style={{ color: "#7d7481" }}
                            >
                              {d.date}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Diagnostic Système */}
              <div
                className="col-span-4 rounded flex flex-col p-6 relative overflow-hidden"
                style={{ background: "#3C0561", color: "white" }}
              >
                <div
                  className="absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 blur-2xl"
                  style={{ background: "rgba(150,13,242,0.15)" }}
                />

                <div className="flex items-center justify-between mb-8 relative z-10">
                  <h3 className="text-sm font-bold tracking-wider uppercase">
                    Diagnostic Infrastructure
                  </h3>
                  <span
                    className="material-symbols-outlined text-[20px]"
                    style={{ color: "#960DF2" }}
                  >
                    terminal
                  </span>
                </div>

                <div className="space-y-5 font-mono text-[11px] relative z-10 flex-1">
                  {SYS_SERVICES.map((svc, i) => (
                    <div
                      key={svc.name}
                      className={`flex items-center justify-between ${i < SYS_SERVICES.length - 1 ? "border-b pb-4" : ""}`}
                      style={{ borderColor: "rgba(255,255,255,0.08)" }}
                    >
                      <div className="min-w-0 flex-1 mr-4">
                        <div className="text-white font-bold mb-1 truncate">
                          {svc.name}
                        </div>
                        <div
                          className="text-[10px] truncate"
                          style={{ color: "rgba(255,255,255,0.4)" }}
                        >
                          {svc.detail}
                        </div>
                      </div>
                      <SysStatusBadge status={svc.status} />
                    </div>
                  ))}
                </div>

                <div
                  className="mt-8 pt-4 border-t flex items-center justify-between text-[10px] font-bold tracking-widest uppercase relative z-10"
                  style={{
                    borderColor: "rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.35)",
                  }}
                >
                  <span>&gt; SIARF.LOG</span>
                  <span style={{ color: "rgba(16,185,129,0.7)" }}>
                    ALL SYSTEMS NOMINAL
                  </span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
