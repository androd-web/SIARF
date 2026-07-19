/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

interface Declaration {
  id: string;
  reference: string;
  statut: string;
  client_nom: string;
  montant_operation: string;
  genere_par_ia: boolean;
  created_at: string;
}

interface Alerte {
  id: string;
  reference: string;
  score_risque: number;
  niveau: string;
  statut: string;
  signaux: { montant: number; description: string };
  created_at: string;
}

function Sidebar() {
  const navItems = [
    { label: "Tableau de bord",      icon: "dashboard",     href: "/dashboard",     section: "surveillance" },
    { label: "Alertes Transactions", icon: "monitoring",    href: "/alertes",       section: "surveillance" },
    { label: "Déclarations Soupçon", icon: "gavel",         href: "/declarations",  section: "surveillance" },
    { label: "Filtrage Entités",     icon: "person_search", href: "/entites",       section: "surveillance" },
    { label: "Journal Audit",        icon: "receipt_long",  href: "/audit",         section: "systeme" },
    { label: "État Système",         icon: "dns",           href: "/systeme",       section: "systeme" },
  ];

  return (
    <aside className="shrink-0 w-60 flex flex-col border-r z-50"
      style={{ background: "#3C0561", borderColor: "#2e004e" }}>
      <div className="h-16 flex items-center px-6 border-b" style={{ borderColor: "#2e004e" }}>
        <div className="flex h-12 w-12 items-center gap-3">
          <Image
            src="/image/logoSIARF.png"
            alt="Logo SIARF"
            width={180}
            height={180}
            className="object-contain"
          />
          <div>
            <div className="text-xs font-bold text-white tracking-widest uppercase">SIARF</div>
            <div className="text-[10px] text-white/50 tracking-wider uppercase font-medium">Compliance Div</div>
          </div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto py-6">
        <div className="px-6 mb-2">
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Surveillance</span>
        </div>
        {navItems.filter(i => i.section === "surveillance").map(item => (
          <Link key={item.href} href={item.href}
            className="flex items-center gap-3 px-6 py-2.5 text-xs font-medium tracking-wide transition-all"
            style={item.href === "/declarations"
              ? { background: "#960DF2", color: "white", borderLeft: "4px solid white" }
              : { color: "rgba(255,255,255,0.55)" }}>
            <span className="material-symbols-outlined text-[17px]">{item.icon}</span>
            {item.label}
          </Link>
        ))}
        <div className="px-6 mb-2 mt-8">
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Système</span>
        </div>
        {navItems.filter(i => i.section === "systeme").map(item => (
          <Link key={item.href} href={item.href}
            className="flex items-center gap-3 px-6 py-2.5 text-xs font-medium tracking-wide text-white/55 hover:text-white hover:bg-white/5 transition-all">
            <span className="material-symbols-outlined text-[17px]">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="p-5 border-t" style={{ borderColor: "#2e004e" }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded flex items-center justify-center font-bold text-sm text-white shrink-0"
            style={{ background: "#2e004e", border: "1px solid rgba(255,255,255,0.1)" }}>JM</div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">J. Mbida</p>
            <p className="text-[10px] text-white/50 truncate uppercase tracking-wider">Officier Conformité</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function StatutBadge({ statut }: { statut: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    brouillon:   { bg: "rgba(217,119,6,0.1)",   color: "#D97706", label: "Brouillon" },
    en_attente:  { bg: "rgba(150,13,242,0.1)",   color: "#960DF2", label: "Validée" },
    transmise:   { bg: "rgba(16,185,129,0.1)",   color: "#10B981", label: "Transmise ANIF" },
    rejetee:     { bg: "rgba(186,26,26,0.1)",    color: "#ba1a1a", label: "Rejetée" },
  };
  const s = map[statut] ?? { bg: "#f0edee", color: "#7d7481", label: statut };
  return (
    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
      style={{ background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}

export default function DeclarationsPage() {
  const [declarations, setDeclarations] = useState<Declaration[]>([]);
  const [alertes, setAlertes] = useState<Alerte[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);
  const [validating, setValidating] = useState<string | null>(null);
  const [transmitting, setTransmitting] = useState<string | null>(null);
  const [showAlerteModal, setShowAlerteModal] = useState(false);
  const [selectedDS, setSelectedDS] = useState<Declaration | null>(null);
  const [showDSModal, setShowDSModal] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("siarf_token") : null;

  const fetchDeclarations = async () => {
    if (!token) return;
    const res = await fetch("http://localhost:8000/api/v1/declarations/", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setDeclarations(data.declarations ?? []);
    setLoading(false);
  };

  const fetchAlertes = async () => {
    if (!token) return;
    const res = await fetch("http://localhost:8000/api/v1/alertes/?statut=en_attente&limit=50", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setAlertes(data.alertes ?? []);
  };

  useEffect(() => {
    fetchDeclarations();
    fetchAlertes();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const genererDS = async (alerteId: string) => {
    if (!token) return;
    setGenerating(alerteId);
    try {
      const res = await fetch(`http://localhost:8000/api/v1/declarations/generer/${alerteId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.detail ?? "Erreur lors de la génération");
        return;
      }
      await fetchDeclarations();
      await fetchAlertes();
      setShowAlerteModal(false);
    } finally {
      setGenerating(null);
    }
  };

  const validerDS = async (id: string) => {
    if (!token) return;
    setValidating(id);
    try {
      await fetch(`http://localhost:8000/api/v1/declarations/${id}/valider`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchDeclarations();
      setShowDSModal(false);
    } finally {
      setValidating(null);
    }
  };

  const transmettreDS = async (id: string) => {
    if (!token) return;
    setTransmitting(id);
    try {
      await fetch(`http://localhost:8000/api/v1/declarations/${id}/transmettre`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchDeclarations();
      setShowDSModal(false);
    } finally {
      setTransmitting(null);
    }
  };

  const transmises = declarations.filter(d => d.statut === "transmise").length;
  const enAttente  = declarations.filter(d => d.statut === "en_attente").length;
  const brouillons = declarations.filter(d => d.statut === "brouillon").length;

  return (
    <div className="h-screen w-screen flex overflow-hidden" style={{ background: "#fcf8f9", fontFamily: "Inter, sans-serif" }}>
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 bg-white flex items-center justify-between px-8 border-b shrink-0"
          style={{ borderColor: "#f0edee" }}>
          <div>
            <h2 className="text-lg font-bold tracking-tight" style={{ color: "#1b1b1c" }}>
              Déclarations de Soupçon
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "#7d7481" }}>
              Gestion et transmission ANIF — Règlement CEMAC 01/03
            </p>
          </div>
          <button
            onClick={() => setShowAlerteModal(true)}
            className="h-9 px-5 flex items-center gap-2 rounded-lg text-white text-xs font-bold uppercase tracking-wider transition-all"
            style={{ background: "#3C0561" }}
            onMouseEnter={e => (e.currentTarget.style.background = "#960DF2")}
            onMouseLeave={e => (e.currentTarget.style.background = "#3C0561")}
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            Nouvelle DS
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-350 mx-auto space-y-5">

            {/* KPIs */}
            <div className="grid grid-cols-3 gap-5">
              {[
                { label: "Transmises à l'ANIF", value: transmises, color: "#10B981", icon: "check_circle" },
                { label: "Validées — En attente",  value: enAttente,  color: "#960DF2", icon: "pending" },
                { label: "Brouillons IA",          value: brouillons, color: "#D97706", icon: "edit_note" },
              ].map(kpi => (
                <div key={kpi.label} className="bg-white rounded-lg p-5 flex items-center justify-between"
                  style={{ border: "1px solid #f0edee" }}>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "#7d7481" }}>{kpi.label}</p>
                    <p className="text-3xl font-bold" style={{ color: "#1b1b1c" }}>{kpi.value}</p>
                  </div>
                  <div className="w-11 h-11 rounded-lg flex items-center justify-center"
                    style={{ background: `${kpi.color}15` }}>
                    <span className="material-symbols-outlined text-[22px]" style={{ color: kpi.color }}>{kpi.icon}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Table DS */}
            <div className="bg-white rounded-lg overflow-hidden" style={{ border: "1px solid #f0edee" }}>
              <div className="p-5 border-b flex items-center justify-between"
                style={{ borderColor: "#f0edee", background: "rgba(240,237,238,0.3)" }}>
                <h3 className="text-sm font-bold" style={{ color: "#1b1b1c" }}>
                  Historique des Déclarations
                </h3>
                <span className="text-xs font-medium" style={{ color: "#7d7481" }}>
                  {declarations.length} déclaration{declarations.length > 1 ? "s" : ""}
                </span>
              </div>

              {loading ? (
                <div className="py-16 text-center text-xs font-bold uppercase tracking-widest" style={{ color: "#7d7481" }}>
                  Chargement...
                </div>
              ) : declarations.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#7d7481" }}>
                    Aucune déclaration générée
                  </p>
                  <button onClick={() => setShowAlerteModal(true)}
                    className="px-4 py-2 rounded-lg text-white text-xs font-bold"
                    style={{ background: "#3C0561" }}>
                    Générer la première DS
                  </button>
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead>
                    <tr style={{ borderBottom: "2px solid #f0edee", background: "rgba(240,237,238,0.5)" }}>
                      {["Référence", "Client", "Montant", "Statut", "IA", "Date", "Actions"].map(h => (
                        <th key={h} className="py-3.5 px-5 text-[10px] font-bold uppercase tracking-[0.15em]"
                          style={{ color: "#7d7481" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {declarations.map((d, i) => (
                      <tr key={d.id}
                        className="cursor-pointer transition-colors"
                        style={{ borderTop: i > 0 ? "1px solid #f6f4fb" : undefined }}
                        onMouseEnter={e => (e.currentTarget.style.background = "#faf8ff")}
                        onMouseLeave={e => (e.currentTarget.style.background = "")}
                        onClick={() => { setSelectedDS(d); setShowDSModal(true); }}
                      >
                        <td className="py-3.5 px-5">
                          <span className="font-mono font-bold text-xs" style={{ color: "#960DF2" }}>{d.reference}</span>
                        </td>
                        <td className="py-3.5 px-5 text-xs font-bold" style={{ color: "#1b1b1c" }}>{d.client_nom}</td>
                        <td className="py-3.5 px-5 text-xs font-mono" style={{ color: "#1b1b1c" }}>{d.montant_operation}</td>
                        <td className="py-3.5 px-5"><StatutBadge statut={d.statut} /></td>
                        <td className="py-3.5 px-5">
                          {d.genere_par_ia && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold"
                              style={{ background: "rgba(150,13,242,0.08)", color: "#960DF2" }}>IA</span>
                          )}
                        </td>
                        <td className="py-3.5 px-5 text-xs" style={{ color: "#7d7481" }}>
                          {new Date(d.created_at).toLocaleDateString("fr-FR")}
                        </td>
                        <td className="py-3.5 px-5">
                          <button onClick={e => { e.stopPropagation(); setSelectedDS(d); setShowDSModal(true); }}
                            className="text-xs font-bold hover:underline" style={{ color: "#960DF2" }}>
                            Gérer →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Modal — Choisir une alerte pour générer DS */}
      {showAlerteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
            <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: "#f0edee" }}>
              <div>
                <h3 className="text-lg font-bold" style={{ color: "#1b1b1c" }}>Générer une Déclaration de Soupçon</h3>
                <p className="text-xs mt-1" style={{ color: "#7d7481" }}>Sélectionnez une alerte pour générer automatiquement la DS</p>
              </div>
              <button onClick={() => setShowAlerteModal(false)} style={{ color: "#7d7481" }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {alertes.length === 0 ? (
                <p className="text-center text-xs font-bold uppercase tracking-widest py-8" style={{ color: "#7d7481" }}>
                  Aucune alerte en attente
                </p>
              ) : alertes.map(a => (
                <div key={a.id} className="p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md"
                  style={{ borderColor: a.score_risque >= 70 ? "#ba1a1a" : "#cec3d1",
                    borderLeft: `4px solid ${a.score_risque >= 70 ? "#ba1a1a" : "#960DF2"}` }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-mono font-bold text-xs mb-1" style={{ color: "#960DF2" }}>{a.reference}</p>
                      <p className="text-xs" style={{ color: "#4c4450" }}>
                        Score AML : <span className="font-bold" style={{ color: a.score_risque >= 70 ? "#ba1a1a" : "#D97706" }}>{a.score_risque}/100</span>
                        {" · "}{new Intl.NumberFormat("fr-FR").format(a.signaux?.montant ?? 0)} XAF
                      </p>
                    </div>
                    <button
                      onClick={() => genererDS(a.id)}
                      disabled={generating === a.id}
                      className="h-9 px-4 rounded-lg text-white text-xs font-bold transition-all disabled:opacity-50"
                      style={{ background: "#3C0561" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#960DF2")}
                      onMouseLeave={e => (e.currentTarget.style.background = "#3C0561")}
                    >
                      {generating === a.id ? "Génération..." : "Générer DS"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal — Gérer une DS */}
      {showDSModal && selectedDS && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: "#f0edee" }}>
              <div>
                <h3 className="text-lg font-bold" style={{ color: "#1b1b1c" }}>{selectedDS.reference}</h3>
                <p className="text-xs mt-1" style={{ color: "#7d7481" }}>Déclaration de Soupçon — {selectedDS.client_nom}</p>
              </div>
              <button onClick={() => setShowDSModal(false)} style={{ color: "#7d7481" }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#7d7481" }}>Statut actuel</span>
                <StatutBadge statut={selectedDS.statut} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#7d7481" }}>Montant</span>
                <span className="text-xs font-mono font-bold" style={{ color: "#1b1b1c" }}>{selectedDS.montant_operation}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#7d7481" }}>Générée par IA</span>
                <span className="text-xs font-bold" style={{ color: selectedDS.genere_par_ia ? "#960DF2" : "#7d7481" }}>
                  {selectedDS.genere_par_ia ? "Oui — SIARF IA" : "Non"}
                </span>
              </div>

              {/* Notice validation humaine */}
              {selectedDS.statut === "brouillon" && (
                <div className="p-4 rounded-xl" style={{ background: "rgba(150,13,242,0.05)", border: "1px solid rgba(150,13,242,0.2)" }}>
                  <p className="text-xs font-bold mb-1" style={{ color: "#960DF2" }}>⚠️ Validation humaine obligatoire</p>
                  <p className="text-xs" style={{ color: "#4c4450" }}>
                    Conformément au Règlement CEMAC 01/03, aucune DS ne peut être transmise à l&apos;ANIF sans validation explicite d&apos;un agent de conformité.
                  </p>
                </div>
              )}
            </div>
            <div className="p-6 border-t flex gap-3" style={{ borderColor: "#f0edee" }}>
              {selectedDS.statut === "brouillon" && (
                <button
                  onClick={() => validerDS(selectedDS.id)}
                  disabled={validating === selectedDS.id}
                  className="flex-1 h-10 rounded-lg text-white text-xs font-bold transition-all disabled:opacity-50"
                  style={{ background: "#3C0561" }}
                >
                  {validating === selectedDS.id ? "Validation..." : "✓ Valider la DS"}
                </button>
              )}
              {selectedDS.statut === "en_attente" && (
                <button
                  onClick={() => transmettreDS(selectedDS.id)}
                  disabled={transmitting === selectedDS.id}
                  className="flex-1 h-10 rounded-lg text-white text-xs font-bold transition-all disabled:opacity-50"
                  style={{ background: "#10B981" }}
                >
                  {transmitting === selectedDS.id ? "Transmission..." : "📤 Transmettre à l'ANIF"}
                </button>
              )}
              {selectedDS.statut === "transmise" && (
                <div className="flex-1 h-10 rounded-lg flex items-center justify-center text-xs font-bold"
                  style={{ background: "rgba(16,185,129,0.1)", color: "#10B981" }}>
                  ✅ DS transmise à l&apos;ANIF avec succès
                </div>
              )}
              <button onClick={() => setShowDSModal(false)}
                className="h-10 px-4 rounded-lg text-xs font-bold border"
                style={{ borderColor: "#cec3d1", color: "#4c4450" }}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}