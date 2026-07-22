"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Declaration {
  id: string;
  reference: string;
  statut: string;
  declarant_nom: string;
  declarant_adresse: string;
  declarant_tel: string;
  declarant_id_unique: string;
  correspondant_nom: string;
  correspondant_fonction: string;
  correspondant_email: string;
  correspondant_tel: string;
  client_nom: string;
  client_prenom: string;
  client_compte: string;
  client_type: string;
  nature_operation: string;
  montant_operation: string;
  description_operation: string;
  typologies: string[];
  commentaires_agent: string;
  signataire_nom: string;
  signataire_qualite: string;
  date_signature: string;
  genere_par_ia: boolean;
  created_at: string;
  reference_anif: string;
  date_transmission: string;
}

function AiField({ label, value, scan }: { label: string; value: string; scan?: boolean }) {
  return (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-wider mb-1 items-center gap-2"
        style={{ color: "#7d7481" }}>
        {label}
        {scan && (
          <span className="text-[9px] font-bold px-1 py-0.5"
            style={{ background: "#f2daff", color: "#3c0561", border: "1px solid #e1b6ff" }}>
            IA
          </span>
        )}
      </label>
      <input readOnly value={value || "—"}
        className="w-full h-8 px-2 text-sm font-medium"
        style={{
          background: "#f4daff", border: "1px solid #e1b6ff",
          color: "#3c0561", borderRadius: 2,
        }}
      />
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-wider mb-1"
        style={{ color: "#7d7481" }}>{label}</label>
      <input readOnly value={value || "—"}
        className="w-full h-8 px-2 text-sm"
        style={{ background: "#f6f3f4", border: "1px solid #cec3d1", color: "#4c4450", borderRadius: 2 }}
      />
    </div>
  );
}

function SectionTitle({ num, title }: { num: string; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-4 pb-1" style={{ borderBottom: "1px solid #3c0561" }}>
      <span className="text-sm font-bold uppercase tracking-widest" style={{ color: "#3c0561" }}>
        {num}. {title}
      </span>
    </div>
  );
}

export default function DeclarationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [ds, setDs] = useState<Declaration | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentaire, setCommentaire] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [completion, setCompletion] = useState(0);

  const token = typeof window !== "undefined" ? localStorage.getItem("siarf_token") : null;

  useEffect(() => {
    if (!token || !id) return;
    fetch(`http://localhost:8000/api/v1/declarations/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        const found = data.declarations?.find((d: Declaration) => d.id === id);
        if (found) {
          setDs(found);
          setCommentaire(found.commentaires_agent ?? "");
          // Calcul complétion
          const fields = [found.declarant_nom, found.client_nom, found.montant_operation,
            found.description_operation, found.nature_operation];
          const filled = fields.filter(Boolean).length;
          setCompletion(Math.round((filled / fields.length) * 100));
        }
        setLoading(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const valider = async () => {
    if (!token) return;
    setSubmitting(true);
    try {
      await fetch(`http://localhost:8000/api/v1/declarations/${id}/valider?commentaire=${encodeURIComponent(commentaire)}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      router.push("/declarations");
    } finally {
      setSubmitting(false);
    }
  };

  const transmettre = async () => {
    if (!token) return;
    setSubmitting(true);
    try {
      await fetch(`http://localhost:8000/api/v1/declarations/${id}/transmettre`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      router.push("/declarations");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center" style={{ background: "#fcf8f9" }}>
      <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#7d7481" }}>Chargement...</p>
    </div>
  );

  if (!ds) return (
    <div className="h-screen flex items-center justify-center" style={{ background: "#fcf8f9" }}>
      <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#ba1a1a" }}>Déclaration introuvable</p>
    </div>
  );

  const typologies = ds.typologies ?? [];

  return (
    <div className="h-screen overflow-hidden flex flex-col" style={{ background: "#fcf8f9", fontFamily: "Inter, sans-serif" }}>

      {/* Header fixe */}
      <header className="h-14 bg-white border-b flex items-center justify-between px-8 shrink-0 z-40"
        style={{ borderColor: "#cec3d1" }}>
        <div className="flex items-center gap-4">
          <Link href="/declarations" className="flex items-center gap-2 text-xs font-bold transition-colors"
            style={{ color: "#7d7481" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#3c0561")}
            onMouseLeave={e => (e.currentTarget.style.color = "#7d7481")}>
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Retour
          </Link>
          <span style={{ color: "#cec3d1" }}>|</span>
          <div>
            <span className="text-sm font-bold tracking-wide" style={{ color: "#3c0561" }}>{ds.reference}</span>
            <span className="ml-3 text-[10px] font-bold px-2 py-0.5 rounded-sm"
              style={{
                background: ds.statut === "transmise" ? "rgba(16,185,129,0.1)" : "rgba(150,13,242,0.1)",
                color: ds.statut === "transmise" ? "#10B981" : "#960DF2",
              }}>
              {ds.statut === "brouillon" ? "BROUILLON IA" : ds.statut === "en_attente" ? "VALIDÉE" : "TRANSMISE ANIF"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px]" style={{ color: "#7d7481" }}>
          <span className="font-mono">SIARF SECURE TUNNEL: ACTIVE (TLS 1.3)</span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar navigation sections */}
        <aside className="w-48 shrink-0 border-r flex flex-col"
          style={{ background: "#3c0561", borderColor: "#2e004e" }}>
          <div className="p-4 border-b" style={{ borderColor: "#2e004e" }}>
            <p className="text-[10px] font-bold text-white uppercase tracking-widest">SIARF</p>
            <p className="text-[10px] font-mono mt-0.5" style={{ color: "#cec3d1" }}>CEMAC UNIT</p>
          </div>
          <nav className="flex-1 py-4">
            <div className="px-4 mb-2 text-[9px] font-bold uppercase tracking-widest" style={{ color: "#cec3d1" }}>
              Sections du Document
            </div>
            {[
              { num: "01", label: "Déclarant",       href: "#sec1" },
              { num: "03", label: "Identité Suspect", href: "#sec3" },
              { num: "05", label: "Opération",        href: "#sec5" },
              { num: "06", label: "Typologie",        href: "#sec6" },
              { num: "07", label: "Observations",     href: "#sec7" },
            ].map(s => (
              <a key={s.num} href={s.href}
                className="flex items-center gap-3 px-4 py-2 text-xs transition-colors"
                style={{ color: "rgba(255,255,255,0.6)" }}
                onMouseEnter={e => (e.currentTarget.style.color = "white")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}>
                <span className="font-mono text-[10px]" style={{ color: "#960DF2" }}>{s.num}</span>
                {s.label}
              </a>
            ))}
          </nav>
          <div className="p-4 border-t" style={{ borderColor: "#2e004e" }}>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 flex items-center justify-center text-[10px] font-bold text-white"
                style={{ background: "#2e004e" }}>JM</div>
              <div>
                <p className="text-[10px] font-bold text-white">J. Mbida</p>
                <p className="text-[9px]" style={{ color: "rgba(255,255,255,0.4)" }}>Officier Conformité</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Document */}
        <main className="flex-1 overflow-y-auto pb-24"
          style={{ scrollbarWidth: "thin", scrollbarColor: "#cec3d1 transparent" }}>
          <div className="max-w-4xl mx-auto px-8 py-8">

            {/* En-tête document */}
            <div className="pb-6 mb-8" style={{ borderBottom: "3px double #3c0561" }}>
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-xl font-bold uppercase tracking-wider mb-1" style={{ color: "#3c0561" }}>
                    DÉCLARATION DE SOUPÇON
                  </h1>
                  <p className="text-xs font-mono" style={{ color: "#7d7481" }}>
                    Formulaire Officiel ANIF — Règlement CEMAC 01/03 — Art. 22 à 26
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold font-mono" style={{ color: "#3c0561" }}>{ds.reference}</p>
                  <p className="text-[10px] font-mono mt-1" style={{ color: "#7d7481" }}>
                    {new Date(ds.created_at).toLocaleDateString("fr-FR")}
                  </p>
                  {ds.genere_par_ia && (
                    <span className="inline-block mt-2 text-[9px] font-bold px-2 py-0.5"
                      style={{ background: "#f2daff", color: "#3c0561", border: "1px solid #e1b6ff" }}>
                      GÉNÉRÉ PAR SIARF IA
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Avertissement IA */}
            {ds.genere_par_ia && ds.statut === "brouillon" && (
              <div className="flex items-start gap-3 p-4 mb-6 rounded-sm"
                style={{ background: "rgba(150,13,242,0.05)", border: "1px solid rgba(150,13,242,0.2)" }}>
                <span className="material-symbols-outlined text-[18px]" style={{ color: "#960DF2" }}>smart_toy</span>
                <div>
                  <p className="text-xs font-bold mb-1" style={{ color: "#960DF2" }}>
                    Document généré automatiquement par SIARF IA
                  </p>
                  <p className="text-[11px]" style={{ color: "#4c4450" }}>
                    Les champs en violet ont été pré-remplis par l&apos;IA. Vérifiez chaque section avant validation.
                    Conformément à l&apos;Art. 48 CEMAC 01/03, la validation humaine est obligatoire avant transmission à l&apos;ANIF.
                  </p>
                </div>
              </div>
            )}

            {/* SECTION 1 — Déclarant */}
            <section id="sec1" className="mb-8 p-6 bg-white" style={{ border: "1px solid #cec3d1" }}>
              <SectionTitle num="I" title="ORGANISME DÉCLARANT" />
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-8">
                  <AiField label="Raison Sociale / Dénomination" value={ds.declarant_nom} scan />
                </div>
                <div className="col-span-4">
                  <Field label="N° Agrément COBAC" value={ds.declarant_id_unique ?? "N/A"} />
                </div>
                <div className="col-span-12">
                  <Field label="Adresse du Siège Social" value={ds.declarant_adresse ?? "N/A"} />
                </div>
              </div>
            </section>

            {/* SECTION 2 — Correspondant */}
            <section className="mb-8 p-6 bg-white" style={{ border: "1px solid #cec3d1" }}>
              <SectionTitle num="II" title="CORRESPONDANT ANIF" />
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-6">
                  <AiField label="Nom et Prénom du Correspondant" value={ds.correspondant_nom ?? ""} />
                </div>
                <div className="col-span-6">
                  <Field label="Fonction" value={ds.correspondant_fonction ?? ""} />
                </div>
                <div className="col-span-6">
                  <Field label="Email" value={ds.correspondant_email ?? ""} />
                </div>
                <div className="col-span-6">
                  <Field label="Téléphone" value={ds.correspondant_tel ?? ""} />
                </div>
              </div>
            </section>

            {/* SECTION 3 — Suspect */}
            <section id="sec3" className="mb-8 p-6 bg-white" style={{ border: "1px solid #cec3d1" }}>
              <SectionTitle num="III" title="PERSONNE PHYSIQUE OU MORALE SUSPECTE" />
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-7">
                  <AiField label="Noms, Prénoms / Raison Sociale" value={`${ds.client_prenom ?? ""} ${ds.client_nom ?? ""}`.trim()} scan />
                </div>
                <div className="col-span-5">
                  <AiField label="Numéro de Compte" value={ds.client_compte ?? ""} scan />
                </div>
                <div className="col-span-6">
                  <Field label="Type de Personne" value={ds.client_type === "physique" ? "Personne Physique" : "Personne Morale"} />
                </div>
              </div>
            </section>

            {/* SECTION 5 — Opération */}
            <section id="sec5" className="mb-8 p-6 bg-white" style={{ border: "1px solid #cec3d1" }}>
              <SectionTitle num="V" title="DESCRIPTION DE L'OPÉRATION SUSPECTE" />
              <div className="grid grid-cols-12 gap-4 mb-4">
                <div className="col-span-5">
                  <AiField label="Type de Transaction" value={ds.nature_operation ?? ""} />
                </div>
                <div className="col-span-4">
                  <AiField label="Montant (XAF)" value={ds.montant_operation ?? ""} scan />
                </div>
                <div className="col-span-3">
                  <Field label="Date Valeur" value={new Date(ds.created_at).toLocaleDateString("fr-FR")} />
                </div>
              </div>
              <div className="p-4 rounded-sm" style={{ background: "#f6f3f4", border: "1px solid #cec3d1" }}>
                <label className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#7d7481" }}>
                    Exposé détaillé des faits (Synthèse SIARF-IA)
                  </span>
                  <span className="text-[9px] font-bold italic" style={{ color: "#3c0561" }}>
                    Source: Analyse Trans-Monitor SIARF
                  </span>
                </label>
                <div className="text-xs leading-relaxed p-3 bg-white min-h-24"
                  style={{ border: "1px solid #f0edee", color: "#4c4450", fontFamily: "Times New Roman, serif" }}>
                  {ds.description_operation || "Aucune description générée."}
                </div>
              </div>
            </section>

            {/* SECTION 6 — Typologies */}
            <section id="sec6" className="mb-8 p-6 bg-white" style={{ border: "1px solid #cec3d1" }}>
              <SectionTitle num="VI" title="TYPOLOGIE DE BLANCHIMENT PRÉSUMÉE" />
              <div className="grid grid-cols-2 gap-2">
                {[
                  "Fractionnement (Smurfing)",
                  "Comportement Inhabituel / Profil Client",
                  "Financement du Terrorisme",
                  "Transferts Internationaux Rapides",
                  "Possible fractionnement pour éviter le seuil de déclaration",
                  "Transaction effectuée à une heure inhabituelle (nuit)",
                ].map(typo => {
                  const detected = typologies.includes(typo);
                  return (
                    <div key={typo} className="flex items-center gap-3 p-2"
                      style={{
                        border: `1px solid ${detected ? "rgba(60,5,97,0.2)" : "#cec3d1"}`,
                        background: detected ? "rgba(60,5,97,0.05)" : "#f6f3f4",
                        opacity: detected ? 1 : 0.6,
                      }}>
                      <input type="checkbox" readOnly checked={detected}
                        className="w-3 h-3" style={{ accentColor: "#3c0561" }} />
                      <span className="text-[11px]" style={{ fontWeight: detected ? 700 : 400, color: detected ? "#3c0561" : "#4c4450" }}>
                        {typo}
                      </span>
                      {detected && (
                        <span className="ml-auto text-[8px] font-bold px-1 uppercase"
                          style={{ background: "white", color: "#3c0561", border: "1px solid rgba(60,5,97,0.2)" }}>
                          SIARF Détecté
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* SECTION 7 — Observations agent */}
            <section id="sec7" className="mb-8 p-6 bg-white" style={{ border: "1px solid #cec3d1" }}>
              <SectionTitle num="VII" title="OBSERVATIONS DU CORRESPONDANT (CONFORMITÉ)" />
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "#7d7481" }}>
                  Analyse Qualitative et Conclusion
                </label>
                <textarea
                  value={commentaire}
                  onChange={e => setCommentaire(e.target.value)}
                  disabled={ds.statut !== "brouillon"}
                  placeholder="Saisir l'évaluation manuelle obligatoire pour finaliser le dossier SIARF..."
                  className="w-full p-3 text-xs min-h-24 outline-none transition-all resize-none"
                  style={{
                    border: "1px solid #cec3d1", borderRadius: 2,
                    background: ds.statut === "brouillon" ? "white" : "#f6f3f4",
                    color: "#1b1b1c",
                    fontStyle: commentaire ? "normal" : "italic",
                  }}
                  onFocus={e => (e.target.style.borderColor = "#3c0561")}
                  onBlur={e => (e.target.style.borderColor = "#cec3d1")}
                />
              </div>
            </section>

            {/* Zone signature */}
            <div className="mt-8 pt-6 flex justify-between items-end"
              style={{ borderTop: "2px solid #f0edee" }}>
              <div className="text-[10px]" style={{ color: "#7d7481" }}>
                Fait à Yaoundé, le {new Date(ds.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}<br />
                ID SIARF-DOC : {ds.id.slice(0, 17).toUpperCase()}
              </div>
              <div className="w-56 h-20 border border-dashed flex items-center justify-center"
                style={{ borderColor: "#cec3d1", background: "#f6f3f4" }}>
                <span className="text-[10px] font-bold uppercase italic" style={{ color: "#7d7481" }}>
                  Scellé Électronique SIARF Requis
                </span>
              </div>
            </div>

            {/* Référence ANIF si transmise */}
            {ds.statut === "transmise" && ds.reference_anif && (
              <div className="mt-6 p-4 rounded-sm flex items-center gap-3"
                style={{ background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.2)" }}>
                <span className="material-symbols-outlined text-[20px]" style={{ color: "#10B981" }}>verified</span>
                <div>
                  <p className="text-xs font-bold" style={{ color: "#10B981" }}>DS transmise à l&apos;ANIF avec succès</p>
                  <p className="text-[11px] font-mono mt-0.5" style={{ color: "#7d7481" }}>
                    Référence ANIF : {ds.reference_anif}
                  </p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Barre de soumission fixe */}
      <footer className="h-17 bg-white border-t flex items-center justify-between px-8 shrink-0 z-40"
        style={{ borderColor: "#cec3d1" }}>
        <div className="flex items-center gap-8">
          {/* Complétion */}
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase" style={{ color: "#7d7481" }}>Complétion SIARF</span>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-36 h-1.5 bg-gray-100 border" style={{ borderColor: "#cec3d1" }}>
                <div className="h-full transition-all" style={{ width: `${completion}%`, background: "#166534" }} />
              </div>
              <span className="text-[11px] font-mono font-bold" style={{ color: "#4c4450" }}>{completion}%</span>
            </div>
          </div>
          <div className="h-8 w-px" style={{ background: "#cec3d1" }} />
          {/* Habilitation */}
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase" style={{ color: "#7d7481" }}>Habilitation</span>
            <span className="text-xs font-bold flex items-center gap-1 mt-1" style={{ color: "#3c0561" }}>
              <span className="material-symbols-outlined text-[14px]" style={{ color: "#166534" }}>verified_user</span>
              Correspondant National SIARF
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/declarations"
            className="h-10 px-5 border text-xs font-bold uppercase tracking-widest flex items-center transition-colors"
            style={{ borderColor: "#7d7481", color: "#7d7481", borderRadius: 2 }}>
            Annuler
          </Link>

          {ds.statut === "brouillon" && (
            <button onClick={valider} disabled={submitting}
              className="h-10 px-6 text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-colors disabled:opacity-50"
              style={{ background: "#3c0561", borderRadius: 2 }}
              onMouseEnter={e => (e.currentTarget.style.background = "#960DF2")}
              onMouseLeave={e => (e.currentTarget.style.background = "#3c0561")}>
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              {submitting ? "Validation..." : "Valider la DS"}
            </button>
          )}

          {ds.statut === "en_attente" && (
            <button onClick={transmettre} disabled={submitting}
              className="h-10 px-6 text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-colors disabled:opacity-50"
              style={{ background: "#3c0561", borderRadius: 2 }}
              onMouseEnter={e => (e.currentTarget.style.background = "#10B981")}
              onMouseLeave={e => (e.currentTarget.style.background = "#3c0561")}>
              <span className="material-symbols-outlined text-[16px]">send</span>
              {submitting ? "Transmission..." : "Valider et Transmettre à l'ANIF via SIARF"}
            </button>
          )}

          {ds.statut === "transmise" && (
            <div className="h-10 px-6 flex items-center gap-2 text-xs font-bold"
              style={{ background: "rgba(16,185,129,0.1)", color: "#10B981", borderRadius: 2 }}>
              <span className="material-symbols-outlined text-[16px]">verified</span>
              Transmise à l&apos;ANIF — {ds.reference_anif}
            </div>
          )}
        </div>
      </footer>

      {/* Barre système */}
      <div className="h-7 flex items-center justify-between px-8 text-[10px] font-mono shrink-0"
        style={{ background: "#3c0561", color: "rgba(255,255,255,0.5)" }}>
        <div className="flex items-center gap-6">
          <span>TERMINAL ID: SIARF-NODE-01</span>
          <span>SIARF SECURE TUNNEL: ACTIVE (SSL/TLS 1.3)</span>
        </div>
        <span>{new Date().toLocaleString("fr-FR")}</span>
      </div>
    </div>
  );
}