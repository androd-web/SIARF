"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";

// ─── Types ────────────────────────────────────────────────────────────────────
type RiskLevel = "critique" | "élevé" | "moyen" | "traité" | "rejeté";
type AlertStatus = "À Analyser" | "En cours" | "Traité" | "Rejeté";
type OpType =
  | "Virement SWIFT"
  | "Dépôt Espèces"
  | "Transfert Mobile"
  | "Paiement Carte"
  | "Virement Interne"
  | "Encaissement Chèque"
  | "Virement SEPA"
  | "Retrait DAB";

interface Alert {
  id: string;
  ref: string;
  client: string;
  compte: string;
  type: OpType;
  montant: number;
  score: number;
  status: AlertStatus;
  date: string;
  risk: RiskLevel;
}

// ─── Données ──────────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ALERTS: Alert[] = [
  {
    id: "1",
    ref: "ALT-2026-0847",
    client: "ESSOMBA Dieudonné",
    compte: "CM-23-40010-09827-01",
    type: "Virement SWIFT",
    montant: 14500000,
    score: 94,
    status: "À Analyser",
    date: "14/05 09:12",
    risk: "critique",
  },
  {
    id: "2",
    ref: "ALT-2026-0846",
    client: "ETS NGUEMA & FILS",
    compte: "CM-23-10023-00456-88",
    type: "Dépôt Espèces",
    montant: 4200000,
    score: 87,
    status: "À Analyser",
    date: "14/05 08:45",
    risk: "critique",
  },
  {
    id: "3",
    ref: "ALT-2026-0845",
    client: "FOKOU Jean-Paul",
    compte: "CM-23-30005-01233-44",
    type: "Transfert Mobile",
    montant: 2100000,
    score: 78,
    status: "En cours",
    date: "14/05 07:30",
    risk: "critique",
  },
  {
    id: "4",
    ref: "ALT-2026-0844",
    client: "BELLA Marie",
    compte: "CM-23-20012-77621-09",
    type: "Paiement Carte",
    montant: 850000,
    score: 68,
    status: "À Analyser",
    date: "13/05 22:15",
    risk: "élevé",
  },
  {
    id: "5",
    ref: "ALT-2026-0843",
    client: "SOCIETE HYDRAC",
    compte: "CM-23-60002-11223-90",
    type: "Virement Interne",
    montant: 45000000,
    score: 61,
    status: "Traité",
    date: "13/05 18:40",
    risk: "élevé",
  },
  {
    id: "6",
    ref: "ALT-2026-0842",
    client: "TCHATCHOUANG Paul",
    compte: "CM-23-50001-99812-76",
    type: "Encaissement Chèque",
    montant: 3450000,
    score: 54,
    status: "À Analyser",
    date: "13/05 16:10",
    risk: "élevé",
  },
  {
    id: "7",
    ref: "ALT-2026-0841",
    client: "KAMGA Hervé",
    compte: "CM-23-10022-33441-22",
    type: "Virement SEPA",
    montant: 120000,
    score: 32,
    status: "Traité",
    date: "13/05 14:05",
    risk: "traité",
  },
  {
    id: "8",
    ref: "ALT-2026-0840",
    client: "ONGOLA Serge",
    compte: "CM-23-40010-01122-33",
    type: "Retrait DAB",
    montant: 500000,
    score: 28,
    status: "Rejeté",
    date: "13/05 11:20",
    risk: "rejeté",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(n: number) {
  return new Intl.NumberFormat("fr-FR").format(n);
}

function RiskDot({ risk }: { risk: RiskLevel }) {
  const colors: Record<RiskLevel, string> = {
    critique: "#ba1a1a",
    élevé: "#D97706",
    moyen: "#8734bd",
    traité: "#10B981",
    rejeté: "#94A3B8",
  };
  return (
    <span
      className="w-2.5 h-2.5 rounded-full block mx-auto"
      style={{
        background: colors[risk],
        boxShadow: risk === "critique" ? `0 0 6px ${colors[risk]}` : "none",
        animation:
          risk === "critique" ? "pulse-dot 1.5s ease-in-out infinite" : "none",
      }}
    />
  );
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 80
      ? { bg: "rgba(186,26,26,0.1)", text: "#ba1a1a" }
      : score >= 60
        ? { bg: "rgba(217,119,6,0.1)", text: "#D97706" }
        : score >= 40
          ? { bg: "rgba(135,52,189,0.08)", text: "#8734bd" }
          : { bg: "rgba(16,185,129,0.1)", text: "#059669" };
  return (
    <span
      className="inline-flex items-center justify-center w-10 h-7 rounded font-extrabold text-xs"
      style={{ background: color.bg, color: color.text }}
    >
      {score}
    </span>
  );
}

function StatusBadge({ status }: { status: AlertStatus }) {
  const map: Record<AlertStatus, { bg: string; color: string }> = {
    "À Analyser": { bg: "rgba(186,26,26,0.08)", color: "#ba1a1a" },
    "En cours": { bg: "rgba(217,119,6,0.08)", color: "#D97706" },
    Traité: { bg: "rgba(16,185,129,0.08)", color: "#059669" },
    Rejeté: { bg: "rgba(100,116,139,0.08)", color: "#64748B" },
  };
  const s = map[status];
  return (
    <span
      className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider whitespace-nowrap"
      style={{ background: s.bg, color: s.color }}
    >
      {status}
    </span>
  );
}

// ─── Sidebar (réutilise le même composant que le dashboard) ───────────────────
function Sidebar() {
  const navItems = [
    { label: "Tableau de bord", icon: "dashboard", href: "/dashboard" },
    { label: "Alertes Transactions", icon: "monitoring", href: "/alertes" },
    { label: "Déclarations Soupçon", icon: "gavel", href: "/declarations" },
    { label: "Filtrage Entités", icon: "person_search", href: "/entites" },
    { label: "Journal Audit", icon: "receipt_long", href: "/audit" },
    { label: "État Système", icon: "dns", href: "/systeme" },
  ];

  return (
    <aside
      className="shrink-0 w-60 flex flex-col border-r z-50"
      style={{ background: "#3C0561", borderColor: "#2e004e" }}
    >
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
          <div>
            <div className="text-xs font-bold text-white tracking-widest uppercase">
              SIARF
            </div>
            <div className="text-[10px] text-white/50 tracking-wider uppercase font-medium">
              Compliance Div
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-6">
        <div className="px-6 mb-2">
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">
            Surveillance
          </span>
        </div>
        {navItems.slice(0, 4).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-6 py-2.5 text-xs font-medium tracking-wide transition-all group"
            style={
              item.href === "/alertes"
                ? {
                    background: "#960DF2",
                    color: "white",
                    borderLeft: "4px solid white",
                  }
                : { color: "rgba(255,255,255,0.55)" }
            }
          >
            <span className="material-symbols-outlined text-[17px]">
              {item.icon}
            </span>
            {item.label}
          </Link>
        ))}
        <div className="px-6 mb-2 mt-8">
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">
            Système
          </span>
        </div>
        {navItems.slice(4).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-6 py-2.5 text-xs font-medium tracking-wide text-white/55 hover:text-white hover:bg-white/5 transition-all"
          >
            <span className="material-symbols-outlined text-[17px]">
              {item.icon}
            </span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-5 border-t" style={{ borderColor: "#2e004e" }}>
        <button
          className="w-full flex items-center justify-center gap-2 h-9 rounded text-white font-bold text-[11px] uppercase tracking-wider mb-4"
          style={{ background: "#960DF2" }}
        >
          <span className="material-symbols-outlined text-[15px]">add</span>
          Nouv. Déclaration
        </button>
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded flex items-center justify-center font-bold text-sm text-white shrink-0"
            style={{
              background: "#2e004e",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            JM
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">J. Mbida</p>
            <p className="text-[10px] text-white/50 truncate uppercase tracking-wider">
              Officier Conformité
            </p>
          </div>
          <button className="text-white/40 hover:text-white transition-colors">
            <span className="material-symbols-outlined text-[17px]">
              logout
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function AlertesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<AlertStatus | "Tous">(
    "Tous",
  );
  const [riskFilter, setRiskFilter] = useState<RiskLevel | "Tous">("Tous");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [time, setTime] = useState("");
  const PER_PAGE = 8;
  const [realAlertes, setRealAlertes] = useState<typeof ALERTS>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loadingAlertes, setLoadingAlertes] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("siarf_token");
    if (!token) return;
    fetch("http://localhost:8000/api/v1/alertes/?limit=200", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        const mapped = data.alertes.map(
          (a: {
            id: string;
            reference: string;
            transaction_id: string;
            score_risque: number;
            niveau: string;
            statut: string;
            signaux: { montant: number; heure: number };
            created_at: string;
          }) => ({
            id: a.id,
            ref: a.reference,
            client: "Client SIARF",
            compte: a.transaction_id?.slice(0, 22) ?? "N/A",
            type: "Virement" as OpType,
            montant: a.signaux?.montant ?? 0,
            score: a.score_risque,
            status:
              a.statut === "en_attente"
                ? "À Analyser"
                : a.statut === "en_cours"
                  ? "En cours"
                  : a.statut === "traite"
                    ? "Traité"
                    : ("Rejeté" as AlertStatus),
            date: new Date(a.created_at).toLocaleDateString("fr-FR"),
            risk:
              a.score_risque >= 70
                ? "critique"
                : a.score_risque >= 30
                  ? "élevé"
                  : ("moyen" as RiskLevel),
          }),
        );
        setRealAlertes(mapped);
      })
      .catch(console.error)
      .finally(() => setLoadingAlertes(false));
  }, []);

  useEffect(() => {
    const tick = () =>
      setTime(
        new Date().toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const filtered = realAlertes.filter((a) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      a.ref.toLowerCase().includes(q) ||
      a.client.toLowerCase().includes(q) ||
      a.compte.includes(q);
    const matchStatus = statusFilter === "Tous" || a.status === statusFilter;
    const matchRisk = riskFilter === "Tous" || a.risk === riskFilter;
    return matchSearch && matchStatus && matchRisk;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const toggleSelect = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelected((prev) =>
      prev.size === paged.length ? new Set() : new Set(paged.map((a) => a.id)),
    );
  }, [paged]);

  const critiques = realAlertes.filter((a) => a.risk === "critique").length;
  const elevees = realAlertes.filter((a) => a.risk === "élevé").length;
  const pending = realAlertes.filter((a) => a.status === "À Analyser").length;
  const total = realAlertes.length;
  return (
    <>
      <style>{`
        @keyframes pulse-dot {
          0%,100% { opacity:1; transform:scale(1); }
          50% { opacity:0.4; transform:scale(0.7); }
        }
      `}</style>

      <div
        className="h-screen w-screen flex overflow-hidden"
        style={{ background: "#fcf8f9", fontFamily: "Inter, sans-serif" }}
      >
        <Sidebar />

        <div className="flex-1 flex flex-col min-w-0">
          {/* ── Topbar ── */}
          <header
            className="h-16 bg-white flex items-center justify-between px-8 border-b shrink-0"
            style={{ borderColor: "#f0edee" }}
          >
            <div className="flex items-center gap-4">
              <div>
                <h2
                  className="text-lg font-bold tracking-tight"
                  style={{ color: "#1b1b1c" }}
                >
                  Alertes Transactions
                </h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                  <span
                    className="text-xs font-medium"
                    style={{ color: "#7d7481" }}
                  >
                    Surveillance active
                  </span>
                  <span className="w-px h-3 bg-gray-200" />
                  <span
                    className="text-xs font-mono font-medium"
                    style={{ color: "#7d7481" }}
                  >
                    {time} UTC
                  </span>
                </div>
              </div>
              <span
                className="px-2.5 py-1 rounded-full text-xs font-bold text-white"
                style={{ background: "#ba1a1a" }}
              >
                {critiques} critiques
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                className="relative w-9 h-9 flex items-center justify-center rounded-lg transition-colors"
                style={{ color: "#7d7481" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color =
                    "var(--siarf-400)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color =
                    "#7d7481";
                }}
              >
                <span className="material-symbols-outlined text-[20px]">
                  notifications
                </span>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#ba1a1a] rounded-full border-2 border-white" />
              </button>
              <button
                className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors"
                style={{ color: "#7d7481" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color =
                    "var(--siarf-400)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color =
                    "#7d7481";
                }}
              >
                <span className="material-symbols-outlined text-[20px]">
                  settings
                </span>
              </button>
              <div
                className="flex items-center gap-2 pl-4 border-l"
                style={{ borderColor: "#f0edee" }}
              >
                <div
                  className="w-8 h-8 rounded flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: "#3C0561" }}
                >
                  JM
                </div>
                <div>
                  <p className="text-xs font-bold" style={{ color: "#1b1b1c" }}>
                    J. Mbida
                  </p>
                  <p
                    className="text-[10px] uppercase tracking-wider"
                    style={{ color: "#7d7481" }}
                  >
                    Officier Conformité
                  </p>
                </div>
              </div>
            </div>
          </header>

          <main
            className="flex-1 overflow-y-auto p-6"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "#ab78d1 transparent",
            }}
          >
            <div className="max-w-[1600px] mx-auto space-y-5">
              {/* ── KPIs ── */}
              <div className="grid grid-cols-4 gap-5">
                {[
                  {
                    label: "Alertes Critiques",
                    value: critiques,
                    icon: "error",
                    color: "#ba1a1a",
                    bg: "rgba(186,26,26,0.06)",
                    border: "#ba1a1a",
                  },
                  {
                    label: "Niveau Élevé",
                    value: elevees,
                    icon: "warning",
                    color: "#D97706",
                    bg: "rgba(217,119,6,0.06)",
                    border: "transparent",
                  },
                  {
                    label: "En Attente Analyse",
                    value: pending,
                    icon: "pending_actions",
                    color: "#960DF2",
                    bg: "rgba(150,13,242,0.06)",
                    border: "transparent",
                  },
                  {
                    label: "Transactions (24H)",
                    value: fmt(12847),
                    icon: "data_exploration",
                    color: "#10B981",
                    bg: "rgba(16,185,129,0.06)",
                    border: "transparent",
                  },
                ].map((kpi) => (
                  <div
                    key={kpi.label}
                    className="bg-white rounded-lg p-5 flex items-center justify-between"
                    style={{
                      border: `1px solid #f0edee`,
                      borderLeft:
                        kpi.border !== "transparent"
                          ? `4px solid ${kpi.border}`
                          : "1px solid #f0edee",
                    }}
                  >
                    <div>
                      <p
                        className="text-[10px] font-bold uppercase tracking-widest mb-2"
                        style={{ color: "#7d7481" }}
                      >
                        {kpi.label}
                      </p>
                      <p
                        className="text-3xl font-bold tracking-tight"
                        style={{ color: "#1b1b1c" }}
                      >
                        {kpi.value}
                      </p>
                    </div>
                    <div
                      className="w-11 h-11 rounded-lg flex items-center justify-center"
                      style={{ background: kpi.bg }}
                    >
                      <span
                        className="material-symbols-outlined text-[22px]"
                        style={{ color: kpi.color }}
                      >
                        {kpi.icon}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* ── Barre filtres ── */}
              <div
                className="bg-white rounded-lg px-4 py-3 flex items-center justify-between"
                style={{ border: "1px solid #f0edee" }}
              >
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
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                      }}
                      placeholder="Référence, client, compte..."
                      className="h-9 pl-9 pr-4 text-xs rounded-lg outline-none w-52 transition-all"
                      style={{
                        border: "1px solid #cec3d1",
                        color: "#1b1b1c",
                        background: "#fafafa",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "#960DF2")}
                      onBlur={(e) => (e.target.style.borderColor = "#cec3d1")}
                    />
                  </div>

                  {/* Filtre statut */}
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value as AlertStatus | "Tous");
                      setPage(1);
                    }}
                    className="h-9 px-3 text-xs rounded-lg outline-none cursor-pointer font-medium"
                    style={{
                      border: "1px solid #cec3d1",
                      color: "#1b1b1c",
                      background: "white",
                    }}
                  >
                    <option value="Tous">Tous les statuts</option>
                    <option value="À Analyser">À Analyser</option>
                    <option value="En cours">En cours</option>
                    <option value="Traité">Traité</option>
                    <option value="Rejeté">Rejeté</option>
                  </select>

                  {/* Filtre risque */}
                  <select
                    value={riskFilter}
                    onChange={(e) => {
                      setRiskFilter(e.target.value as RiskLevel | "Tous");
                      setPage(1);
                    }}
                    className="h-9 px-3 text-xs rounded-lg outline-none cursor-pointer font-medium"
                    style={{
                      border: "1px solid #cec3d1",
                      color: "#1b1b1c",
                      background: "white",
                    }}
                  >
                    <option value="Tous">Tous les niveaux</option>
                    <option value="critique">Critique</option>
                    <option value="élevé">Élevé</option>
                    <option value="moyen">Moyen</option>
                    <option value="traité">Traité</option>
                    <option value="rejeté">Rejeté</option>
                  </select>

                  {filtered.length !== total && (
                    <span
                      className="text-xs font-medium"
                      style={{ color: "#7d7481" }}
                    >
                      {filtered.length} résultat{filtered.length > 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {selected.size > 0 && (
                    <span
                      className="text-xs font-bold px-3 py-1.5 rounded-lg"
                      style={{
                        background: "rgba(150,13,242,0.08)",
                        color: "#960DF2",
                      }}
                    >
                      {selected.size} sélectionné{selected.size > 1 ? "s" : ""}
                    </span>
                  )}
                  <button
                    className="h-9 px-4 flex items-center gap-2 text-xs font-bold rounded-lg transition-all"
                    style={{
                      border: "1px solid #cec3d1",
                      color: "#1b1b1c",
                      background: "white",
                    }}
                  >
                    <span className="material-symbols-outlined text-[15px]">
                      download
                    </span>
                    Export CSV
                  </button>
                </div>
              </div>

              {/* ── Table ── */}
              <div
                className="bg-white rounded-lg overflow-hidden"
                style={{ border: "1px solid #f0edee" }}
              >
                <div className="overflow-x-auto">
                  <table
                    className="w-full text-left"
                    style={{ borderCollapse: "collapse" }}
                  >
                    <thead>
                      <tr
                        style={{
                          background: "rgba(240,237,238,0.5)",
                          borderBottom: "2px solid #f0edee",
                        }}
                      >
                        <th className="py-3.5 px-4 w-10">
                          <input
                            type="checkbox"
                            checked={
                              selected.size === paged.length && paged.length > 0
                            }
                            onChange={toggleAll}
                            className="cursor-pointer"
                            style={{ accentColor: "#960DF2" }}
                          />
                        </th>
                        <th className="py-3.5 px-3 w-10" />
                        {[
                          "Référence",
                          "Client / Compte",
                          "Type",
                          "Montant",
                          "Score IA",
                          "Statut",
                          "Date",
                          "",
                        ].map((h) => (
                          <th
                            key={h}
                            className="py-3.5 px-4 text-[10px] font-bold uppercase tracking-[0.15em] whitespace-nowrap"
                            style={{ color: "#7d7481" }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paged.length === 0 ? (
                        <tr>
                          <td
                            colSpan={10}
                            className="py-16 text-center text-xs font-bold uppercase tracking-widest"
                            style={{ color: "#7d7481" }}
                          >
                            Aucune alerte trouvée
                          </td>
                        </tr>
                      ) : (
                        paged.map((alert, i) => {
                          const isResolved =
                            alert.status === "Traité" ||
                            alert.status === "Rejeté";
                          return (
                            <tr
                              key={alert.id}
                              className="cursor-pointer transition-colors"
                              style={{
                                borderTop:
                                  i > 0 ? "1px solid #f6f4fb" : undefined,
                                opacity: isResolved ? 0.55 : 1,
                              }}
                              onMouseEnter={(e) =>
                                !isResolved &&
                                ((
                                  e.currentTarget as HTMLTableRowElement
                                ).style.background = "#faf8ff")
                              }
                              onMouseLeave={(e) =>
                                ((
                                  e.currentTarget as HTMLTableRowElement
                                ).style.background = "")
                              }
                            >
                              <td className="py-3.5 px-4">
                                <input
                                  type="checkbox"
                                  checked={selected.has(alert.id)}
                                  onChange={() => toggleSelect(alert.id)}
                                  onClick={(e) => e.stopPropagation()}
                                  className="cursor-pointer"
                                  style={{ accentColor: "#960DF2" }}
                                />
                              </td>

                              <td className="py-3.5 px-3">
                                <RiskDot risk={alert.risk} />
                              </td>

                              <td className="py-3.5 px-4 whitespace-nowrap">
                                <span
                                  className="font-mono font-bold text-xs"
                                  style={{ color: "#960DF2" }}
                                >
                                  {alert.ref}
                                </span>
                              </td>

                              <td className="py-3.5 px-4">
                                <p
                                  className="font-bold text-xs whitespace-nowrap"
                                  style={{ color: "#1b1b1c" }}
                                >
                                  {alert.client}
                                </p>
                                <p
                                  className="text-[10px] font-mono mt-0.5"
                                  style={{ color: "#7d7481" }}
                                >
                                  {alert.compte}
                                </p>
                              </td>

                              <td className="py-3.5 px-4 whitespace-nowrap">
                                <span
                                  className="px-2 py-1 rounded text-[10px] font-medium"
                                  style={{
                                    background: "#f0edee",
                                    color: "#4c4450",
                                  }}
                                >
                                  {alert.type}
                                </span>
                              </td>

                              <td className="py-3.5 px-4 whitespace-nowrap">
                                <span
                                  className="font-bold text-xs"
                                  style={{ color: "#1b1b1c" }}
                                >
                                  {fmt(alert.montant)}
                                </span>
                                <span
                                  className="text-[10px] ml-1"
                                  style={{ color: "#7d7481" }}
                                >
                                  FCFA
                                </span>
                              </td>

                              <td className="py-3.5 px-4 text-center">
                                <ScoreBadge score={alert.score} />
                              </td>

                              <td className="py-3.5 px-4 whitespace-nowrap">
                                <StatusBadge status={alert.status} />
                              </td>

                              <td
                                className="py-3.5 px-4 whitespace-nowrap text-xs font-medium"
                                style={{ color: "#7d7481" }}
                              >
                                {alert.date}
                              </td>

                              <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                {alert.status === "À Analyser" ? (
                                  <button
                                    className="h-7 px-3 rounded text-[11px] font-bold text-white transition-all"
                                    style={{ background: "#3C0561" }}
                                    onMouseEnter={(e) =>
                                      ((
                                        e.currentTarget as HTMLButtonElement
                                      ).style.background = "#960DF2")
                                    }
                                    onMouseLeave={(e) =>
                                      ((
                                        e.currentTarget as HTMLButtonElement
                                      ).style.background = "#3C0561")
                                    }
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    Analyser
                                  </button>
                                ) : (
                                  <button
                                    className="w-7 h-7 flex items-center justify-center rounded transition-colors ml-auto"
                                    style={{ color: "#7d7481" }}
                                    onMouseEnter={(e) =>
                                      ((
                                        e.currentTarget as HTMLButtonElement
                                      ).style.color = "#960DF2")
                                    }
                                    onMouseLeave={(e) =>
                                      ((
                                        e.currentTarget as HTMLButtonElement
                                      ).style.color = "#7d7481")
                                    }
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <span className="material-symbols-outlined text-[18px]">
                                      visibility
                                    </span>
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* ── Pagination ── */}
                <div
                  className="px-5 py-3 flex items-center justify-between border-t"
                  style={{
                    borderColor: "#f0edee",
                    background: "rgba(240,237,238,0.3)",
                  }}
                >
                  <p
                    className="text-xs font-medium"
                    style={{ color: "#7d7481" }}
                  >
                    {filtered.length === 0
                      ? "Aucun résultat"
                      : `${(page - 1) * PER_PAGE + 1}–${Math.min(page * PER_PAGE, filtered.length)} sur ${filtered.length} alertes`}
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="w-8 h-8 flex items-center justify-center rounded border text-xs transition-all disabled:opacity-30"
                      style={{
                        borderColor: "#cec3d1",
                        color: "#1b1b1c",
                        background: "white",
                      }}
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        chevron_left
                      </span>
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (n) => (
                        <button
                          key={n}
                          onClick={() => setPage(n)}
                          className="w-8 h-8 flex items-center justify-center rounded text-xs font-bold transition-all"
                          style={
                            page === n
                              ? {
                                  background: "#960DF2",
                                  color: "white",
                                  border: "none",
                                }
                              : {
                                  border: "1px solid #cec3d1",
                                  color: "#1b1b1c",
                                  background: "white",
                                }
                          }
                        >
                          {n}
                        </button>
                      ),
                    )}

                    <button
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={page === totalPages || totalPages === 0}
                      className="w-8 h-8 flex items-center justify-center rounded border text-xs transition-all disabled:opacity-30"
                      style={{
                        borderColor: "#cec3d1",
                        color: "#1b1b1c",
                        background: "white",
                      }}
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        chevron_right
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* ── Footer système ── */}
              <div
                className="flex items-center justify-between py-2 text-[10px] font-bold uppercase tracking-widest"
                style={{ color: "#7d7481" }}
              >
                <div className="flex items-center gap-4">
                  <span>Sync: 14/05/2026 10:45:22</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300" />
                  <span>Node: YAOUNDE-CENTRAL-01</span>
                </div>
                <div
                  className="flex items-center gap-2"
                  style={{ color: "#10B981" }}
                >
                  <span>Encodage AES-256</span>
                  <span className="material-symbols-outlined text-[14px]">
                    lock
                  </span>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
