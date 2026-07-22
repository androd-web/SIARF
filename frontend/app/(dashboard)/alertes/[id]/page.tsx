"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";

// ─── Types API ────────────────────────────────────────────────────────────────
interface AlerteDetailAPI {
  id: string;
  reference: string;
  score_risque: number;
  niveau: string;
  statut: string;
  signaux: Record<string, unknown>;
  created_at: string;
  transaction: {
    id: string;
    reference: string;
    montant: number;
    devise: string;
    compte_emetteur: string;
    nom_emetteur: string;
    compte_destinataire: string;
    nom_destinataire: string;
    type_operation: string;
    date_transaction: string;
  } | null;
}

// ─── Données mock fallback ────────────────────────────────────────────────────
const MOCK_DETAIL: AlerteDetailAPI = {
  id: "1",
  reference: "ALT-2026-0847",
  score_risque: 94,
  niveau: "critique",
  statut: "en_attente",
  signaux: {},
  created_at: new Date().toISOString(),
  transaction: {
    id: "tx-1",
    reference: "TXN-2026-98234",
    montant: 14500000,
    devise: "XAF",
    compte_emetteur: "CM-23-40010-09827-01",
    nom_emetteur: "ESSOMBA Dieudonné",
    compte_destinataire: "DE89-3704-0044-0532-0130-00",
    nom_destinataire: "Deutsche Bank AG Frankfurt",
    type_operation: "Virement SWIFT International",
    date_transaction: "2026-07-19T09:12:44",
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(n: number) { return new Intl.NumberFormat("fr-FR").format(n); }

function initiales(nom: string) {
  return nom.split(" ").map(w => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
}

function getAnomalyFactors(score: number) {
  return [
    { label: "Montant anormalement élevé vs historique",    score: Math.min(99, score + 2),  color: score >= 70 ? "#ba1a1a" : "#D97706" },
    { label: "Destination / Contrepartie à risque",         score: Math.max(40, score - 5),  color: score >= 70 ? "#ba1a1a" : "#D97706" },
    { label: "Fréquence inhabituelle des opérations",       score: Math.max(30, score - 20), color: "#8734bd" },
    { label: "Bénéficiaire hors réseau client habituel",    score: Math.max(25, score - 28), color: "#8734bd" },
  ];
}

function getAMLRules(score: number) {
  const rules = [];
  if (score >= 80) rules.push({ ref: "AML-R04", severity: "HAUTE",   label: "Virement transfrontalier > seuil CEMAC",    desc: "Transfert supérieur à 5 000 000 FCFA vers juridiction étrangère sans déclaration préalable." });
  if (score >= 70) rules.push({ ref: "SCR-R02", severity: "MOYENNE", label: "Correspondance liste sanctions OFAC/ONU",    desc: "Correspondance partielle détectée sur liste sanctions internationales." });
  if (score >= 60) rules.push({ ref: "AML-R12", severity: "MOYENNE", label: "Structuration potentielle (Smurfing)",        desc: "Opérations multiples proches du seuil déclaratif sur 48h." });
  if (rules.length === 0) rules.push({ ref: "AML-R07", severity: "MOYENNE", label: "Activité inhabituelle compte", desc: "Opération atypique au regard du profil comportemental habituel du client." });
  return rules as { ref: string; severity: "HAUTE" | "MOYENNE"; label: string; desc: string }[];
}

// ─── Composants ───────────────────────────────────────────────────────────────
function ScoreGauge({ score, animated }: { score: number; animated: boolean }) {
  const r = 22, circ = 2 * Math.PI * r;
  const color = score >= 80 ? "#ba1a1a" : score >= 60 ? "#D97706" : "#8734bd";
  return (
    <div className="relative w-14 h-14 flex items-center justify-center">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 56 56">
        <circle cx="28" cy="28" r={r} fill="transparent" stroke="#f0edee" strokeWidth="5" />
        <circle cx="28" cy="28" r={r} fill="transparent" stroke={color} strokeWidth="5"
          strokeDasharray={circ} strokeDashoffset={circ - (animated ? score / 100 : 0) * circ}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)" }} />
      </svg>
      <span className="absolute text-xs font-extrabold font-mono" style={{ color }}>{score}</span>
    </div>
  );
}

function AnomalyBar({ label, score, color, animated }: { label: string; score: number; color: string; animated: boolean }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-[11px] font-medium" style={{ color: "#1b1b1c" }}>{label}</span>
        <span className="text-[11px] font-bold font-mono" style={{ color }}>{score}%</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#f0edee" }}>
        <div className="h-full rounded-full transition-all duration-1000"
          style={{ width: animated ? `${score}%` : "0%", background: color }} />
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function Sidebar({ activeRef }: { activeRef: string }) {
  const nav = [
    { label: "Tableau de bord",      icon: "dashboard",     href: "/dashboard"    },
    { label: "Alertes Transactions", icon: "monitoring",    href: "/alertes"      },
    { label: "Déclarations Soupçon", icon: "gavel",         href: "/declarations" },
    { label: "Filtrage Entités",     icon: "person_search", href: "/entites"      },
    { label: "Journal Audit",        icon: "receipt_long",  href: "/audit"        },
    { label: "État Système",         icon: "dns",           href: "/systeme"      },
  ];
  return (
    <aside className="shrink-0 w-60 flex flex-col border-r" style={{ background: "#3C0561", borderColor: "#2e004e" }}>
      <div className="h-16 flex items-center px-6 border-b" style={{ borderColor: "#2e004e" }}>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 relative shrink-0">
            <Image src="/image/logoSIARF.png" alt="Logo SIARF" fill className="object-contain" />
          </div>
          <div>
            <div className="text-xs font-bold text-white tracking-widest uppercase">SIARF</div>
            <div className="text-[10px] text-white/50 tracking-wider uppercase">Compliance Div</div>
          </div>
        </div>
      </div>
      <nav className="flex-1 py-6 overflow-y-auto">
        <div className="px-6 mb-2"><span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Surveillance</span></div>
        {nav.slice(0, 4).map(item => (
          <Link key={item.href} href={item.href}
            className="flex items-center gap-3 px-6 py-2.5 text-xs font-medium tracking-wide transition-all"
            style={item.href === "/alertes"
              ? { background: "#960DF2", color: "white", borderLeft: "4px solid white" }
              : { color: "rgba(255,255,255,0.55)" }}>
            <span className="material-symbols-outlined text-[17px]">{item.icon}</span>
            {item.label}
          </Link>
        ))}
        <div className="px-6 mb-2 mt-6"><span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Système</span></div>
        {nav.slice(4).map(item => (
          <Link key={item.href} href={item.href}
            className="flex items-center gap-3 px-6 py-2.5 text-xs font-medium tracking-wide text-white/55 hover:text-white hover:bg-white/5 transition-all">
            <span className="material-symbols-outlined text-[17px]">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t" style={{ borderColor: "#2e004e" }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded flex items-center justify-center font-bold text-sm text-white shrink-0"
            style={{ background: "#2e004e" }}>JM</div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">J. Mbida</p>
            <p className="text-[10px] text-white/50 truncate uppercase">Officier Conformité</p>
          </div>
          <button className="text-white/40 hover:text-white transition-colors">
            <span className="material-symbols-outlined text-[17px]">logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function AnalysePage() {
  const params   = useParams();
  const router   = useRouter();
  const alerteId = params.id as string;

  const [data,        setData]        = useState<AlerteDetailAPI | null>(null);
  const [loading,     setLoading]     = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [erreur,      setErreur]      = useState(false);
  const [apiDown,     setApiDown]     = useState(false);
  const [animated,    setAnimated]    = useState(false);
  const [commentaire, setCommentaire] = useState("");
  const [notifier,    setNotifier]    = useState(false);
  const [showDS,      setShowDS]      = useState(false);
  const [showRejet,   setShowRejet]   = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [time,        setTime]        = useState("");

  // ── Fetch alerte ──────────────────────────────────────────────────────────
useEffect(() => {
  const token = localStorage.getItem("siarf_token");

  if (!token) {
    // Utiliser startTransition pour éviter le setState synchrone
    Promise.resolve().then(() => {
      setData(MOCK_DETAIL);
      setApiDown(true);
      setLoading(false);
    });
    return;
  }

  fetch(`http://localhost:8000/api/v1/alertes/${alerteId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then(r => {
      if (!r.ok) throw new Error();
      return r.json();
    })
    .then(setData)
    .catch(() => {
      setData(MOCK_DETAIL);
      setApiDown(true);
    })
    .finally(() => setLoading(false));
}, [alerteId]);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 300);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // ── Actions ───────────────────────────────────────────────────────────────
  const handleGenererDS = async () => {
    setSaving(true);
    const token = localStorage.getItem("siarf_token");
    try {
      if (token && !apiDown) {
        const qs = new URLSearchParams({ statut: "en_cours" });
        if (commentaire) qs.set("commentaire", commentaire);
        await fetch(`http://localhost:8000/api/v1/alertes/${alerteId}/statut?${qs}`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setShowDS(true);
    } finally {
      setSaving(false);
    }
  };

  const handleRejeter = async () => {
    if (!commentaire.trim()) { setShowRejet(true); return; }
    setSaving(true);
    const token = localStorage.getItem("siarf_token");
    try {
      if (token && !apiDown) {
        const qs = new URLSearchParams({ statut: "rejete", commentaire });
        await fetch(`http://localhost:8000/api/v1/alertes/${alerteId}/statut?${qs}`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setShowRejet(true);
    } finally {
      setSaving(false);
    }
  };

  // ── États chargement / erreur ─────────────────────────────────────────────
  if (loading) return (
    <div className="h-screen flex items-center justify-center" style={{ background: "#fcf8f9" }}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "#960DF2", borderTopColor: "transparent" }} />
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#7d7481" }}>
          Chargement de l&apos;alerte...
        </p>
      </div>
    </div>
  );

  if (!data) return (
    <div className="h-screen flex flex-col items-center justify-center gap-4" style={{ background: "#fcf8f9" }}>
      <span className="material-symbols-outlined text-[48px]" style={{ color: "#ba1a1a" }}>error</span>
      <p className="text-sm font-bold" style={{ color: "#1b1b1c" }}>Alerte introuvable</p>
      <button onClick={() => router.push("/alertes")}
        className="h-10 px-6 rounded-lg text-xs font-bold text-white"
        style={{ background: "#3C0561" }}>
        ← Retour aux alertes
      </button>
    </div>
  );

  const tx          = data.transaction;
  const score       = data.score_risque;
  const scoreColor  = score >= 80 ? "#ba1a1a" : score >= 60 ? "#D97706" : "#8734bd";
  const riskLabel   = score >= 80 ? "Critique" : score >= 60 ? "Élevé" : "Moyen";
  const nomClient   = tx?.nom_emetteur ?? "Client SIARF";
  const anomalies   = getAnomalyFactors(score);
  const amlRules    = getAMLRules(score);

  const histoTxs = [
    { date: tx?.date_transaction?.slice(0, 10) ?? "—", type: tx?.type_operation ?? "—", montant: fmt(tx?.montant ?? 0), statut: "ALERTÉ" as const },
    { date: "15-07-2026", type: "Virement Local",   montant: "250 000",   statut: "Validé" as const },
    { date: "12-07-2026", type: "Retrait GAB",      montant: "100 000",   statut: "Validé" as const },
    { date: "05-07-2026", type: "Dépôt Espèces",   montant: "5 000 000", statut: "Validé" as const },
    { date: "01-07-2026", type: "Frais Tenue Cpt", montant: "2 500",     statut: "Validé" as const },
  ];

  return (
    <>
      <style>{`
        @keyframes slide-in { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }
        .slide-in { animation: slide-in 0.35s ease forwards; }
      `}</style>

      <div className="h-screen w-screen flex overflow-hidden"
        style={{ background: "#fcf8f9", fontFamily: "Inter, sans-serif", color: "#1b1b1c" }}>
        <Sidebar activeRef={data.reference} />

        <div className="flex-1 flex flex-col min-w-0">

          {/* ── Topbar ── */}
          <header className="h-16 bg-white flex items-center justify-between px-6 border-b shrink-0"
            style={{ borderColor: "#f0edee" }}>
            <nav className="flex items-center gap-1 text-xs">
              <Link href="/alertes" className="font-medium transition-colors"
                style={{ color: "#7d7481" }}
                onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = "#960DF2"}
                onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = "#7d7481"}>
                Alertes Transactions
              </Link>
              <span className="material-symbols-outlined text-[14px]" style={{ color: "#cec3d1" }}>chevron_right</span>
              <span className="font-bold" style={{ color: "#3C0561" }}>{data.reference} — Analyse en cours</span>
              {apiDown && (
                <span className="ml-3 px-2 py-0.5 rounded text-[10px] font-bold"
                  style={{ background: "rgba(217,119,6,0.1)", color: "#D97706" }}>Mode démo</span>
              )}
            </nav>
            <div className="flex items-center gap-4">
              <span className="text-xs font-mono font-medium" style={{ color: "#7d7481" }}>{time} UTC</span>
              <button className="relative w-9 h-9 flex items-center justify-center rounded-lg"
                style={{ color: "#7d7481" }}
                onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = "#960DF2"}
                onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = "#7d7481"}>
                <span className="material-symbols-outlined text-[20px]">notifications</span>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#ba1a1a] rounded-full border-2 border-white" />
              </button>
              <div className="w-8 h-8 rounded flex items-center justify-center font-bold text-xs text-white"
                style={{ background: "#3C0561" }}>JM</div>
            </div>
          </header>

          {/* ── Corps ── */}
          <div className="flex-1 overflow-hidden flex gap-5 p-5">

            {/* Colonne gauche 65% */}
            <div className="flex flex-col gap-4 overflow-y-auto pr-1"
              style={{ width: "65%", scrollbarWidth: "thin", scrollbarColor: "#ab78d1 transparent" }}>

              {/* Card 1 — Détail */}
              <div className="bg-white rounded-lg p-5 slide-in" style={{ border: "1px solid #f0edee" }}>
                <div className="flex items-center justify-between mb-4 pb-3 border-b" style={{ borderColor: "#f0edee" }}>
                  <div className="flex items-center gap-3">
                    <h2 className="text-sm font-bold" style={{ color: "#3C0561" }}>Détail Transaction</h2>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase tracking-wider"
                      style={{ background: scoreColor }}>{riskLabel}</span>
                    <span className="text-[11px] font-mono font-medium" style={{ color: "#7d7481" }}>REF: {data.reference}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#7d7481" }}>Score IA</span>
                    <ScoreGauge score={score} animated={animated} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-x-6 gap-y-4">
                  {[
                    { label: "Client",       value: nomClient,                               mono: false },
                    { label: "Compte",       value: tx?.compte_emetteur ?? "N/A",            mono: true  },
                    { label: "Opération",    value: tx?.type_operation ?? "N/A",             mono: false },
                    { label: "Destination",  value: tx?.nom_destinataire ?? "N/A",           mono: false },
                    { label: "Agence",       value: "Agence Douala-Bonanjo",                 mono: false },
                    { label: "Date / Heure", value: tx?.date_transaction?.replace("T", " ").slice(0, 19) ?? "N/A", mono: true },
                  ].map(f => (
                    <div key={f.label}>
                      <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "#7d7481" }}>{f.label}</p>
                      <p className={`text-xs font-semibold ${f.mono ? "font-mono" : ""}`} style={{ color: "#1b1b1c" }}>{f.value}</p>
                    </div>
                  ))}
                  <div className="col-span-3 pt-3 border-t" style={{ borderColor: "#f0edee" }}>
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "#7d7481" }}>Montant</p>
                    <p className="text-2xl font-extrabold font-mono" style={{ color: "#3C0561" }}>
                      {fmt(tx?.montant ?? 0)} <span className="text-base font-bold" style={{ color: "#7d7481" }}>{tx?.devise ?? "XAF"}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 2 — IA */}
              <div className="bg-white rounded-lg overflow-hidden slide-in" style={{ border: "1px solid #f0edee", animationDelay: "80ms" }}>
                <div className="flex items-center gap-2 px-5 py-3" style={{ background: "#3C0561" }}>
                  <span className="material-symbols-outlined text-[18px] text-white">psychology</span>
                  <h2 className="text-sm font-bold text-white">Explication IA — Isolation Forest</h2>
                  <span className="ml-auto px-2 py-0.5 rounded text-[10px] font-bold"
                    style={{ background: "rgba(255,255,255,0.15)", color: "#EACFFC" }}>
                    Confiance modèle: {Math.min(99, score + 3).toFixed(1)}%
                  </span>
                </div>
                <div className="p-5">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-4">
                    {anomalies.map(f => (
                      <AnomalyBar key={f.label} label={f.label} score={f.score} color={f.color} animated={animated} />
                    ))}
                  </div>
                  <div className="flex items-center gap-2 pt-3 border-t" style={{ borderColor: "#f0edee" }}>
                    <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#7d7481" }}>Règles:</span>
                    {amlRules.map(r => (
                      <span key={r.ref} className="px-3 py-1 rounded-full text-[10px] font-bold"
                        style={{ background: "rgba(60,5,97,0.08)", color: "#3C0561", border: "1px solid rgba(60,5,97,0.15)" }}>
                        {r.ref}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card 3 — Historique */}
              <div className="bg-white rounded-lg p-5 slide-in" style={{ border: "1px solid #f0edee", animationDelay: "160ms" }}>
                <h2 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#7d7481" }}>
                  Historique Compte — 90 jours
                </h2>
                <table className="w-full text-left" style={{ borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid #3C0561" }}>
                      {["Date", "Type", "Montant (FCFA)", "Statut"].map((h, i) => (
                        <th key={h} className={`pb-2 text-[10px] font-bold uppercase tracking-widest ${i === 3 ? "text-right" : ""}`}
                          style={{ color: "#7d7481" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {histoTxs.map((tx, i) => (
                      <tr key={i} style={{
                        borderBottom: i < histoTxs.length - 1 ? "1px solid #f0edee" : "none",
                        background: tx.statut === "ALERTÉ" ? "rgba(186,26,26,0.04)" : "transparent",
                      }}>
                        <td className="py-2.5 text-xs font-mono font-medium"
                          style={{ color: tx.statut === "ALERTÉ" ? "#ba1a1a" : "#1b1b1c" }}>{tx.date}</td>
                        <td className="py-2.5 text-xs" style={{ color: "#1b1b1c" }}>{tx.type}</td>
                        <td className="py-2.5 text-xs font-mono font-bold" style={{ color: "#1b1b1c" }}>{tx.montant}</td>
                        <td className="py-2.5 text-right">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold"
                            style={tx.statut === "ALERTÉ"
                              ? { background: "#ba1a1a", color: "white" }
                              : { background: "#f0edee", color: "#7d7481" }}>
                            {tx.statut}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Colonne droite 35% */}
            <div className="flex flex-col gap-4 overflow-y-auto"
              style={{ width: "35%", scrollbarWidth: "thin", scrollbarColor: "#ab78d1 transparent" }}>

              {/* Card 4 — Actions */}
              <div className="bg-white rounded-lg p-5 slide-in" style={{ border: "1px solid #f0edee" }}>
                <h2 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#7d7481" }}>Actions</h2>

                {!showDS ? (
                  <button onClick={handleGenererDS} disabled={saving}
                    className="w-full h-11 flex items-center justify-center gap-2 rounded-lg font-bold text-xs uppercase tracking-wider text-white mb-3 transition-all disabled:opacity-50"
                    style={{ background: "#3C0561" }}
                    onMouseEnter={e => !saving && ((e.currentTarget as HTMLButtonElement).style.background = "#960DF2")}
                    onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = "#3C0561")}>
                    <span className="material-symbols-outlined text-[17px]">description</span>
                    {saving ? "En cours..." : "Générer Déclaration de Soupçon"}
                  </button>
                ) : (
                  <div className="mb-3 p-3 rounded-lg text-xs font-medium flex items-center gap-2 slide-in"
                    style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", color: "#059669" }}>
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    DS générée — En attente de validation responsable
                  </div>
                )}

                {!showRejet ? (
                  <button onClick={handleRejeter} disabled={saving}
                    className="w-full h-10 flex items-center justify-center gap-2 rounded-lg font-bold text-xs uppercase tracking-wider mb-4 transition-all disabled:opacity-50"
                    style={{ border: "1.5px solid #ba1a1a", color: "#ba1a1a", background: "transparent" }}
                    onMouseEnter={e => !saving && ((e.currentTarget as HTMLButtonElement).style.background = "rgba(186,26,26,0.05)")}
                    onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = "transparent")}>
                    <span className="material-symbols-outlined text-[17px]">close</span>
                    Rejeter l&apos;alerte
                  </button>
                ) : (
                  <div className="mb-4 p-3 rounded-lg text-xs font-medium flex items-center gap-2 slide-in"
                    style={{ background: "rgba(186,26,26,0.06)", border: "1px solid rgba(186,26,26,0.2)", color: "#ba1a1a" }}>
                    <span className="material-symbols-outlined text-[16px]">info</span>
                    {commentaire.trim() ? "Alerte rejetée avec succès" : "Motif de rejet requis dans le commentaire"}
                  </div>
                )}

                <div className="mb-3">
                  <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "#7d7481" }}>
                    Commentaire analyste
                  </label>
                  <textarea value={commentaire} onChange={e => setCommentaire(e.target.value)}
                    placeholder="Saisir les conclusions de l'investigation..."
                    rows={4} maxLength={500}
                    className="w-full px-3 py-2.5 text-xs rounded-lg outline-none resize-none transition-all"
                    style={{ border: "1.5px solid #cec3d1", background: "#fafafa", color: "#1b1b1c", lineHeight: 1.6 }}
                    onFocus={e => e.target.style.borderColor = "#960DF2"}
                    onBlur={e => e.target.style.borderColor = "#cec3d1"} />
                  <p className="text-right text-[10px] mt-1" style={{ color: commentaire.length > 450 ? "#D97706" : "#7d7481" }}>
                    {commentaire.length} / 500
                  </p>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={notifier} onChange={e => setNotifier(e.target.checked)}
                    style={{ accentColor: "#960DF2" }} />
                  <span className="text-xs" style={{ color: "#4c4450" }}>Notifier le responsable conformité</span>
                </label>
              </div>

              {/* Card 5 — Profil Client */}
              <div className="bg-white rounded-lg p-5 slide-in" style={{ border: "1px solid #f0edee", animationDelay: "80ms" }}>
                <div className="flex items-center gap-3 mb-4 pb-3 border-b" style={{ borderColor: "#f0edee" }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white shrink-0"
                    style={{ background: "#3C0561" }}>{initiales(nomClient)}</div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: "#1b1b1c" }}>{nomClient}</p>
                    <p className="text-[10px] font-mono" style={{ color: "#7d7481" }}>{tx?.compte_emetteur ?? "N/A"}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {[
                    { label: "Alertes passées", value: "3",        badge: null },
                    { label: "DS émises",        value: "1",        badge: null },
                    { label: "Score global",     value: riskLabel,  badge: { bg: score >= 80 ? "rgba(186,26,26,0.1)" : "rgba(217,119,6,0.1)", color: scoreColor } },
                    { label: "Statut KYC",       value: "Vérifié",  badge: { bg: "rgba(16,185,129,0.1)", color: "#059669" } },
                    { label: "PEP / PPE",        value: "Non",      badge: { bg: "#f0edee", color: "#7d7481" } },
                  ].map(row => (
                    <div key={row.label} className="flex justify-between items-center py-2 border-b" style={{ borderColor: "#f6f4fb" }}>
                      <span className="text-xs" style={{ color: "#7d7481" }}>{row.label}</span>
                      {row.badge ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                          style={{ background: row.badge.bg, color: row.badge.color }}>{row.value}</span>
                      ) : (
                        <span className="text-xs font-bold font-mono" style={{ color: "#1b1b1c" }}>{row.value}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 6 — Règles AML */}
              <div className="bg-white rounded-lg p-5 slide-in" style={{ border: "1px solid #f0edee", animationDelay: "160ms" }}>
                <h2 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#7d7481" }}>
                  Règles AML Déclenchées
                </h2>
                <div className="space-y-3">
                  {amlRules.map(rule => (
                    <div key={rule.ref} className="p-3 rounded-lg"
                      style={{ background: "#fafafa", border: "1px solid #f0edee",
                        borderLeftWidth: 3, borderLeftColor: rule.severity === "HAUTE" ? "#ba1a1a" : "#8734bd" }}>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs font-bold font-mono" style={{ color: "#1b1b1c" }}>{rule.ref}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold"
                          style={rule.severity === "HAUTE"
                            ? { background: "rgba(186,26,26,0.1)", color: "#ba1a1a" }
                            : { background: "rgba(135,52,189,0.1)", color: "#8734bd" }}>
                          {rule.severity}
                        </span>
                      </div>
                      <p className="text-[11px] font-semibold mb-1" style={{ color: "#1b1b1c" }}>{rule.label}</p>
                      <p className="text-[10px] leading-relaxed" style={{ color: "#7d7481" }}>{rule.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Footer ── */}
          <footer className="h-9 flex items-center justify-between px-6 shrink-0" style={{ background: "#3C0561" }}>
            <div className="flex items-center gap-6 text-[10px] font-mono" style={{ color: "rgba(234,207,252,0.5)" }}>
              <span>Analyste: <span className="text-white font-bold">J. Mbida</span></span>
              <span>Session: <span className="text-white font-bold">{time} UTC</span></span>
            </div>
            <div className="flex items-center gap-6 text-[10px] font-mono" style={{ color: "rgba(234,207,252,0.5)" }}>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[13px]">lock</span>
                <span>AES-256</span>
              </div>
              <span>Node: <span style={{ color: "rgba(234,207,252,0.8)" }}>YAOUNDE-CENTRAL-01</span></span>
              <div className="flex items-center gap-1.5" style={{ color: "#10B981" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                <span>ONLINE</span>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}