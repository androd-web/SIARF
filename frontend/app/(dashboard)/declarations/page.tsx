// /* eslint-disable react-hooks/set-state-in-effect */
// "use client";

// import { useState, useEffect } from "react";
// import Link from "next/link";
// import Image from "next/image";

// interface Declaration {
//   id: string;
//   reference: string;
//   statut: string;
//   client_nom: string;
//   montant_operation: string;
//   genere_par_ia: boolean;
//   created_at: string;
// }

// interface Alerte {
//   id: string;
//   reference: string;
//   score_risque: number;
//   niveau: string;
//   statut: string;
//   signaux: { montant: number; description: string };
//   created_at: string;
// }

// function Sidebar() {
//   const navItems = [
//     {
//       label: "Tableau de bord",
//       icon: "dashboard",
//       href: "/dashboard",
//       section: "surveillance",
//     },
//     {
//       label: "Alertes Transactions",
//       icon: "monitoring",
//       href: "/alertes",
//       section: "surveillance",
//     },
//     {
//       label: "Déclarations Soupçon",
//       icon: "gavel",
//       href: "/declarations",
//       section: "surveillance",
//     },
//     {
//       label: "Filtrage Entités",
//       icon: "person_search",
//       href: "/entites",
//       section: "surveillance",
//     },
//     {
//       label: "Journal Audit",
//       icon: "receipt_long",
//       href: "/audit",
//       section: "systeme",
//     },
//     {
//       label: "État Système",
//       icon: "dns",
//       href: "/systeme",
//       section: "systeme",
//     },
//   ];

//   return (
//     <aside
//       className="shrink-0 w-60 flex flex-col border-r z-50"
//       style={{ background: "#3C0561", borderColor: "#2e004e" }}
//     >
//       <div
//         className="h-16 flex items-center px-6 border-b"
//         style={{ borderColor: "#2e004e" }}
//       >
//         <div className="flex h-12 w-12 items-center gap-3">
//           <Image
//             src="/image/logoSIARF.png"
//             alt="Logo SIARF"
//             width={180}
//             height={180}
//             className="object-contain"
//           />
//           <div>
//             <div className="text-xs font-bold text-white tracking-widest uppercase">
//               SIARF
//             </div>
//             <div className="text-[10px] text-white/50 tracking-wider uppercase font-medium">
//               Compliance Div
//             </div>
//           </div>
//         </div>
//       </div>
//       <nav className="flex-1 overflow-y-auto py-6">
//         <div className="px-6 mb-2">
//           <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">
//             Surveillance
//           </span>
//         </div>
//         {navItems
//           .filter((i) => i.section === "surveillance")
//           .map((item) => (
//             <Link
//               key={item.href}
//               href={item.href}
//               className="flex items-center gap-3 px-6 py-2.5 text-xs font-medium tracking-wide transition-all"
//               style={
//                 item.href === "/declarations"
//                   ? {
//                       background: "#960DF2",
//                       color: "white",
//                       borderLeft: "4px solid white",
//                     }
//                   : { color: "rgba(255,255,255,0.55)" }
//               }
//             >
//               <span className="material-symbols-outlined text-[17px]">
//                 {item.icon}
//               </span>
//               {item.label}
//             </Link>
//           ))}
//         <div className="px-6 mb-2 mt-8">
//           <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">
//             Système
//           </span>
//         </div>
//         {navItems
//           .filter((i) => i.section === "systeme")
//           .map((item) => (
//             <Link
//               key={item.href}
//               href={item.href}
//               className="flex items-center gap-3 px-6 py-2.5 text-xs font-medium tracking-wide text-white/55 hover:text-white hover:bg-white/5 transition-all"
//             >
//               <span className="material-symbols-outlined text-[17px]">
//                 {item.icon}
//               </span>
//               {item.label}
//             </Link>
//           ))}
//       </nav>
//       <div className="p-5 border-t" style={{ borderColor: "#2e004e" }}>
//         <div className="flex items-center gap-3">
//           <div
//             className="w-9 h-9 rounded flex items-center justify-center font-bold text-sm text-white shrink-0"
//             style={{
//               background: "#2e004e",
//               border: "1px solid rgba(255,255,255,0.1)",
//             }}
//           >
//             JM
//           </div>
//           <div className="flex-1 min-w-0">
//             <p className="text-xs font-bold text-white truncate">J. Mbida</p>
//             <p className="text-[10px] text-white/50 truncate uppercase tracking-wider">
//               Officier Conformité
//             </p>
//           </div>
//         </div>
//       </div>
//     </aside>
//   );
// }

// function StatutBadge({ statut }: { statut: string }) {
//   const map: Record<string, { bg: string; color: string; label: string }> = {
//     brouillon: {
//       bg: "rgba(217,119,6,0.1)",
//       color: "#D97706",
//       label: "Brouillon",
//     },
//     en_attente: {
//       bg: "rgba(150,13,242,0.1)",
//       color: "#960DF2",
//       label: "Validée",
//     },
//     transmise: {
//       bg: "rgba(16,185,129,0.1)",
//       color: "#10B981",
//       label: "Transmise ANIF",
//     },
//     rejetee: { bg: "rgba(186,26,26,0.1)", color: "#ba1a1a", label: "Rejetée" },
//   };
//   const s = map[statut] ?? { bg: "#f0edee", color: "#7d7481", label: statut };
//   return (
//     <span
//       className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
//       style={{ background: s.bg, color: s.color }}
//     >
//       {s.label}
//     </span>
//   );
// }

// export default function DeclarationsPage() {
//   const [declarations, setDeclarations] = useState<Declaration[]>([]);
//   const [alertes, setAlertes] = useState<Alerte[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [generating, setGenerating] = useState<string | null>(null);
//   const [validating, setValidating] = useState<string | null>(null);
//   const [transmitting, setTransmitting] = useState<string | null>(null);
//   const [showAlerteModal, setShowAlerteModal] = useState(false);
//   const [selectedDS, setSelectedDS] = useState<Declaration | null>(null);
//   const [showDSModal, setShowDSModal] = useState(false);

//   const token =
//     typeof window !== "undefined" ? localStorage.getItem("siarf_token") : null;

//   const fetchDeclarations = async () => {
//     if (!token) return;
//     const res = await fetch("http://localhost:8000/api/v1/declarations/", {
//       headers: { Authorization: `Bearer ${token}` },
//     });
//     const data = await res.json();
//     setDeclarations(data.declarations ?? []);
//     setLoading(false);
//   };

//   const fetchAlertes = async () => {
//     if (!token) return;
//     const res = await fetch(
//       "http://localhost:8000/api/v1/alertes/?statut=en_attente&limit=50",
//       {
//         headers: { Authorization: `Bearer ${token}` },
//       },
//     );
//     const data = await res.json();
//     setAlertes(data.alertes ?? []);
//   };

//   useEffect(() => {
//     fetchDeclarations();
//     fetchAlertes();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const genererDS = async (alerteId: string) => {
//     if (!token) return;
//     setGenerating(alerteId);
//     try {
//       const res = await fetch(
//         `http://localhost:8000/api/v1/declarations/generer/${alerteId}`,
//         {
//           method: "POST",
//           headers: { Authorization: `Bearer ${token}` },
//         },
//       );
//       if (!res.ok) {
//         const err = await res.json();
//         alert(err.detail ?? "Erreur lors de la génération");
//         return;
//       }
//       await fetchDeclarations();
//       await fetchAlertes();
//       setShowAlerteModal(false);
//     } finally {
//       setGenerating(null);
//     }
//   };

//   const validerDS = async (id: string) => {
//     if (!token) return;
//     setValidating(id);
//     try {
//       await fetch(`http://localhost:8000/api/v1/declarations/${id}/valider`, {
//         method: "PUT",
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       await fetchDeclarations();
//       setShowDSModal(false);
//     } finally {
//       setValidating(null);
//     }
//   };

//   const transmettreDS = async (id: string) => {
//     if (!token) return;
//     setTransmitting(id);
//     try {
//       await fetch(
//         `http://localhost:8000/api/v1/declarations/${id}/transmettre`,
//         {
//           method: "PUT",
//           headers: { Authorization: `Bearer ${token}` },
//         },
//       );
//       await fetchDeclarations();
//       setShowDSModal(false);
//     } finally {
//       setTransmitting(null);
//     }
//   };

//   const transmises = declarations.filter(
//     (d) => d.statut === "transmise",
//   ).length;
//   const enAttente = declarations.filter(
//     (d) => d.statut === "en_attente",
//   ).length;
//   const brouillons = declarations.filter(
//     (d) => d.statut === "brouillon",
//   ).length;

//   return (
//     <div
//       className="h-screen w-screen flex overflow-hidden"
//       style={{ background: "#fcf8f9", fontFamily: "Inter, sans-serif" }}
//     >
//       <Sidebar />

//       <div className="flex-1 flex flex-col min-w-0">
//         {/* Topbar */}
//         <header
//           className="h-16 bg-white flex items-center justify-between px-8 border-b shrink-0"
//           style={{ borderColor: "#f0edee" }}
//         >
//           <div>
//             <h2
//               className="text-lg font-bold tracking-tight"
//               style={{ color: "#1b1b1c" }}
//             >
//               Déclarations de Soupçon
//             </h2>
//             <p className="text-xs mt-0.5" style={{ color: "#7d7481" }}>
//               Gestion et transmission ANIF — Règlement CEMAC 01/03
//             </p>
//           </div>
//           <button
//             onClick={() => setShowAlerteModal(true)}
//             className="h-9 px-5 flex items-center gap-2 rounded-lg text-white text-xs font-bold uppercase tracking-wider transition-all"
//             style={{ background: "#3C0561" }}
//             onMouseEnter={(e) => (e.currentTarget.style.background = "#960DF2")}
//             onMouseLeave={(e) => (e.currentTarget.style.background = "#3C0561")}
//           >
//             <span className="material-symbols-outlined text-[16px]">add</span>
//             Nouvelle DS
//           </button>
//         </header>

//         <main className="flex-1 overflow-y-auto p-6">
//           <div className="max-w-350 mx-auto space-y-5">
//             {/* KPIs */}
//             <div className="grid grid-cols-3 gap-5">
//               {[
//                 {
//                   label: "Transmises à l'ANIF",
//                   value: transmises,
//                   color: "#10B981",
//                   icon: "check_circle",
//                 },
//                 {
//                   label: "Validées — En attente",
//                   value: enAttente,
//                   color: "#960DF2",
//                   icon: "pending",
//                 },
//                 {
//                   label: "Brouillons IA",
//                   value: brouillons,
//                   color: "#D97706",
//                   icon: "edit_note",
//                 },
//               ].map((kpi) => (
//                 <div
//                   key={kpi.label}
//                   className="bg-white rounded-lg p-5 flex items-center justify-between"
//                   style={{ border: "1px solid #f0edee" }}
//                 >
//                   <div>
//                     <p
//                       className="text-[10px] font-bold uppercase tracking-widest mb-2"
//                       style={{ color: "#7d7481" }}
//                     >
//                       {kpi.label}
//                     </p>
//                     <p
//                       className="text-3xl font-bold"
//                       style={{ color: "#1b1b1c" }}
//                     >
//                       {kpi.value}
//                     </p>
//                   </div>
//                   <div
//                     className="w-11 h-11 rounded-lg flex items-center justify-center"
//                     style={{ background: `${kpi.color}15` }}
//                   >
//                     <span
//                       className="material-symbols-outlined text-[22px]"
//                       style={{ color: kpi.color }}
//                     >
//                       {kpi.icon}
//                     </span>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             {/* Table DS */}
//             <div
//               className="bg-white rounded-lg overflow-hidden"
//               style={{ border: "1px solid #f0edee" }}
//             >
//               <div
//                 className="p-5 border-b flex items-center justify-between"
//                 style={{
//                   borderColor: "#f0edee",
//                   background: "rgba(240,237,238,0.3)",
//                 }}
//               >
//                 <h3 className="text-sm font-bold" style={{ color: "#1b1b1c" }}>
//                   Historique des Déclarations
//                 </h3>
//                 <span
//                   className="text-xs font-medium"
//                   style={{ color: "#7d7481" }}
//                 >
//                   {declarations.length} déclaration
//                   {declarations.length > 1 ? "s" : ""}
//                 </span>
//               </div>

//               {loading ? (
//                 <div
//                   className="py-16 text-center text-xs font-bold uppercase tracking-widest"
//                   style={{ color: "#7d7481" }}
//                 >
//                   Chargement...
//                 </div>
//               ) : declarations.length === 0 ? (
//                 <div className="py-16 text-center">
//                   <p
//                     className="text-xs font-bold uppercase tracking-widest mb-3"
//                     style={{ color: "#7d7481" }}
//                   >
//                     Aucune déclaration générée
//                   </p>
//                   <button
//                     onClick={() => setShowAlerteModal(true)}
//                     className="px-4 py-2 rounded-lg text-white text-xs font-bold"
//                     style={{ background: "#3C0561" }}
//                   >
//                     Générer la première DS
//                   </button>
//                 </div>
//               ) : (
//                 <table className="w-full text-left">
//                   <thead>
//                     <tr
//                       style={{
//                         borderBottom: "2px solid #f0edee",
//                         background: "rgba(240,237,238,0.5)",
//                       }}
//                     >
//                       {[
//                         "Référence",
//                         "Client",
//                         "Montant",
//                         "Statut",
//                         "IA",
//                         "Date",
//                         "Actions",
//                       ].map((h) => (
//                         <th
//                           key={h}
//                           className="py-3.5 px-5 text-[10px] font-bold uppercase tracking-[0.15em]"
//                           style={{ color: "#7d7481" }}
//                         >
//                           {h}
//                         </th>
//                       ))}
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {declarations.map((d, i) => (
//                       <tr
//                         key={d.id}
//                         className="cursor-pointer transition-colors"
//                         style={{
//                           borderTop: i > 0 ? "1px solid #f6f4fb" : undefined,
//                         }}
//                         onMouseEnter={(e) =>
//                           (e.currentTarget.style.background = "#faf8ff")
//                         }
//                         onMouseLeave={(e) =>
//                           (e.currentTarget.style.background = "")
//                         }
//                         onClick={() => {
//                           setSelectedDS(d);
//                           setShowDSModal(true);
//                         }}
//                       >
//                         <td className="py-3.5 px-5">
//                           <span
//                             className="font-mono font-bold text-xs"
//                             style={{ color: "#960DF2" }}
//                           >
//                             {d.reference}
//                           </span>
//                         </td>
//                         <td
//                           className="py-3.5 px-5 text-xs font-bold"
//                           style={{ color: "#1b1b1c" }}
//                         >
//                           {d.client_nom}
//                         </td>
//                         <td
//                           className="py-3.5 px-5 text-xs font-mono"
//                           style={{ color: "#1b1b1c" }}
//                         >
//                           {d.montant_operation}
//                         </td>
//                         <td className="py-3.5 px-5">
//                           <StatutBadge statut={d.statut} />
//                         </td>
//                         <td className="py-3.5 px-5">
//                           {d.genere_par_ia && (
//                             <span
//                               className="px-2 py-0.5 rounded text-[10px] font-bold"
//                               style={{
//                                 background: "rgba(150,13,242,0.08)",
//                                 color: "#960DF2",
//                               }}
//                             >
//                               IA
//                             </span>
//                           )}
//                         </td>
//                         <td
//                           className="py-3.5 px-5 text-xs"
//                           style={{ color: "#7d7481" }}
//                         >
//                           {new Date(d.created_at).toLocaleDateString("fr-FR")}
//                         </td>
//                         <td className="py-3.5 px-5">
//                           <Link
//                             href={`/declarations/${d.id}`}
//                             className="text-xs font-bold hover:underline"
//                             style={{ color: "#960DF2" }}
//                             onClick={(e) => e.stopPropagation()}
//                           >
//                             Gérer →
//                           </Link>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               )}
//             </div>
//           </div>
//         </main>
//       </div>

//       {/* Modal — Choisir une alerte pour générer DS */}
//       {showAlerteModal && (
//         <div
//           className="fixed inset-0 z-50 flex items-center justify-center"
//           style={{ background: "rgba(0,0,0,0.5)" }}
//         >
//           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
//             <div
//               className="p-6 border-b flex items-center justify-between"
//               style={{ borderColor: "#f0edee" }}
//             >
//               <div>
//                 <h3 className="text-lg font-bold" style={{ color: "#1b1b1c" }}>
//                   Générer une Déclaration de Soupçon
//                 </h3>
//                 <p className="text-xs mt-1" style={{ color: "#7d7481" }}>
//                   Sélectionnez une alerte pour générer automatiquement la DS
//                 </p>
//               </div>
//               <button
//                 onClick={() => setShowAlerteModal(false)}
//                 style={{ color: "#7d7481" }}
//               >
//                 <span className="material-symbols-outlined">close</span>
//               </button>
//             </div>
//             <div className="flex-1 overflow-y-auto p-6 space-y-3">
//               {alertes.length === 0 ? (
//                 <p
//                   className="text-center text-xs font-bold uppercase tracking-widest py-8"
//                   style={{ color: "#7d7481" }}
//                 >
//                   Aucune alerte en attente
//                 </p>
//               ) : (
//                 alertes.map((a) => (
//                   <div
//                     key={a.id}
//                     className="p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md"
//                     style={{
//                       borderColor: a.score_risque >= 70 ? "#ba1a1a" : "#cec3d1",
//                       borderLeft: `4px solid ${a.score_risque >= 70 ? "#ba1a1a" : "#960DF2"}`,
//                     }}
//                   >
//                     <div className="flex items-center justify-between">
//                       <div>
//                         <p
//                           className="font-mono font-bold text-xs mb-1"
//                           style={{ color: "#960DF2" }}
//                         >
//                           {a.reference}
//                         </p>
//                         <p className="text-xs" style={{ color: "#4c4450" }}>
//                           Score AML :{" "}
//                           <span
//                             className="font-bold"
//                             style={{
//                               color:
//                                 a.score_risque >= 70 ? "#ba1a1a" : "#D97706",
//                             }}
//                           >
//                             {a.score_risque}/100
//                           </span>
//                           {" · "}
//                           {new Intl.NumberFormat("fr-FR").format(
//                             a.signaux?.montant ?? 0,
//                           )}{" "}
//                           XAF
//                         </p>
//                       </div>
//                       <button
//                         onClick={() => genererDS(a.id)}
//                         disabled={generating === a.id}
//                         className="h-9 px-4 rounded-lg text-white text-xs font-bold transition-all disabled:opacity-50"
//                         style={{ background: "#3C0561" }}
//                         onMouseEnter={(e) =>
//                           (e.currentTarget.style.background = "#960DF2")
//                         }
//                         onMouseLeave={(e) =>
//                           (e.currentTarget.style.background = "#3C0561")
//                         }
//                       >
//                         {generating === a.id ? "Génération..." : "Générer DS"}
//                       </button>
//                     </div>
//                   </div>
//                 ))
//               )}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Modal — Gérer une DS */}
//       {showDSModal && selectedDS && (
//         <div
//           className="fixed inset-0 z-50 flex items-center justify-center"
//           style={{ background: "rgba(0,0,0,0.5)" }}
//         >
//           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
//             <div
//               className="p-6 border-b flex items-center justify-between"
//               style={{ borderColor: "#f0edee" }}
//             >
//               <div>
//                 <h3 className="text-lg font-bold" style={{ color: "#1b1b1c" }}>
//                   {selectedDS.reference}
//                 </h3>
//                 <p className="text-xs mt-1" style={{ color: "#7d7481" }}>
//                   Déclaration de Soupçon — {selectedDS.client_nom}
//                 </p>
//               </div>
//               <button
//                 onClick={() => setShowDSModal(false)}
//                 style={{ color: "#7d7481" }}
//               >
//                 <span className="material-symbols-outlined">close</span>
//               </button>
//             </div>
//             <div className="p-6 space-y-4">
//               <div className="flex items-center justify-between">
//                 <span
//                   className="text-xs font-bold uppercase tracking-widest"
//                   style={{ color: "#7d7481" }}
//                 >
//                   Statut actuel
//                 </span>
//                 <StatutBadge statut={selectedDS.statut} />
//               </div>
//               <div className="flex items-center justify-between">
//                 <span
//                   className="text-xs font-bold uppercase tracking-widest"
//                   style={{ color: "#7d7481" }}
//                 >
//                   Montant
//                 </span>
//                 <span
//                   className="text-xs font-mono font-bold"
//                   style={{ color: "#1b1b1c" }}
//                 >
//                   {selectedDS.montant_operation}
//                 </span>
//               </div>
//               <div className="flex items-center justify-between">
//                 <span
//                   className="text-xs font-bold uppercase tracking-widest"
//                   style={{ color: "#7d7481" }}
//                 >
//                   Générée par IA
//                 </span>
//                 <span
//                   className="text-xs font-bold"
//                   style={{
//                     color: selectedDS.genere_par_ia ? "#960DF2" : "#7d7481",
//                   }}
//                 >
//                   {selectedDS.genere_par_ia ? "Oui — SIARF IA" : "Non"}
//                 </span>
//               </div>

//               {/* Notice validation humaine */}
//               {selectedDS.statut === "brouillon" && (
//                 <div
//                   className="p-4 rounded-xl"
//                   style={{
//                     background: "rgba(150,13,242,0.05)",
//                     border: "1px solid rgba(150,13,242,0.2)",
//                   }}
//                 >
//                   <p
//                     className="text-xs font-bold mb-1"
//                     style={{ color: "#960DF2" }}
//                   >
//                     ⚠️ Validation humaine obligatoire
//                   </p>
//                   <p className="text-xs" style={{ color: "#4c4450" }}>
//                     Conformément au Règlement CEMAC 01/03, aucune DS ne peut
//                     être transmise à l&apos;ANIF sans validation explicite
//                     d&apos;un agent de conformité.
//                   </p>
//                 </div>
//               )}
//             </div>
//             <div
//               className="p-6 border-t flex gap-3"
//               style={{ borderColor: "#f0edee" }}
//             >
//               {selectedDS.statut === "brouillon" && (
//                 <button
//                   onClick={() => validerDS(selectedDS.id)}
//                   disabled={validating === selectedDS.id}
//                   className="flex-1 h-10 rounded-lg text-white text-xs font-bold transition-all disabled:opacity-50"
//                   style={{ background: "#3C0561" }}
//                 >
//                   {validating === selectedDS.id
//                     ? "Validation..."
//                     : "✓ Valider la DS"}
//                 </button>
//               )}
//               {selectedDS.statut === "en_attente" && (
//                 <button
//                   onClick={() => transmettreDS(selectedDS.id)}
//                   disabled={transmitting === selectedDS.id}
//                   className="flex-1 h-10 rounded-lg text-white text-xs font-bold transition-all disabled:opacity-50"
//                   style={{ background: "#10B981" }}
//                 >
//                   {transmitting === selectedDS.id
//                     ? "Transmission..."
//                     : "📤 Transmettre à l'ANIF"}
//                 </button>
//               )}
//               {selectedDS.statut === "transmise" && (
//                 <div
//                   className="flex-1 h-10 rounded-lg flex items-center justify-center text-xs font-bold"
//                   style={{
//                     background: "rgba(16,185,129,0.1)",
//                     color: "#10B981",
//                   }}
//                 >
//                   ✅ DS transmise à l&apos;ANIF avec succès
//                 </div>
//               )}
//               <button
//                 onClick={() => setShowDSModal(false)}
//                 className="h-10 px-4 rounded-lg text-xs font-bold border"
//                 style={{ borderColor: "#cec3d1", color: "#4c4450" }}
//               >
//                 Fermer
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

// ─── Types ────────────────────────────────────────────────────────────────────
type DSStatut = "Transmis" | "Validé" | "Brouillon" | "Rejeté";

interface Declaration {
  id: string;
  ref: string;
  date: string;
  client: string;
  montant: number;
  statut: DSStatut;
  refAnif?: string;
  alerteRef?: string;
  banque: string;
  agent: string;
  devise: string;
}

interface ApiAlerte {
  id: string;
  reference: string;
  score_risque: number;
  niveau: string;
  statut: string;
  signaux: { montant: number };
  created_at: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(n: number) {
  return new Intl.NumberFormat("fr-FR").format(n);
}

function StatutBadge({ statut }: { statut: DSStatut }) {
  const map: Record<DSStatut, { bg: string; color: string; icon: string }> = {
    Transmis: {
      bg: "rgba(22,101,52,0.1)",
      color: "#166534",
      icon: "check_circle",
    },
    Validé: { bg: "rgba(135,52,189,0.1)", color: "#8734bd", icon: "schedule" },
    Brouillon: {
      bg: "rgba(217,119,6,0.1)",
      color: "#D97706",
      icon: "edit_document",
    },
    Rejeté: { bg: "rgba(186,26,26,0.1)", color: "#ba1a1a", icon: "error" },
  };
  const s = map[statut];
  return (
    <span
      className="px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 w-fit"
      style={{ background: s.bg, color: s.color }}
    >
      <span className="material-symbols-outlined text-[13px]">{s.icon}</span>
      {statut}
    </span>
  );
}

function Stepper({ statut }: { statut: DSStatut }) {
  const steps = ["Créé", "Validé", "Transmis", "Acquitté"];
  const activeIdx =
    statut === "Rejeté" || statut === "Brouillon"
      ? 0
      : statut === "Validé"
        ? 1
        : 3;
  const isRejete = statut === "Rejeté";

  return (
    <div className="relative flex justify-between mt-6">
      <div
        className="absolute top-3.5 left-0 w-full h-0.5"
        style={{ background: "#e5e2e3" }}
      />
      <div
        className="absolute top-3.5 left-0 h-0.5 transition-all duration-700"
        style={{
          width: isRejete ? "0%" : `${(activeIdx / (steps.length - 1)) * 100}%`,
          background: "#166534",
        }}
      />
      {steps.map((step, i) => {
        const done = !isRejete && i <= activeIdx;
        return (
          <div
            key={step}
            className="relative flex flex-col items-center gap-1.5 z-10"
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center transition-all"
              style={{
                background:
                  isRejete && i === 0
                    ? "#ba1a1a"
                    : done
                      ? "#166534"
                      : "#e5e2e3",
              }}
            >
              {done || (isRejete && i === 0) ? (
                <span className="material-symbols-outlined text-white text-[14px]">
                  {isRejete && i === 0 ? "close" : "check"}
                </span>
              ) : (
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: "#cec3d1" }}
                />
              )}
            </div>
            <span
              className="text-[9px] font-bold uppercase tracking-wider"
              style={{ color: done ? "#166534" : "#7d7481" }}
            >
              {step}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function PreviewPanel({
  ds,
  onClose,
  onValider,
  onTransmettre,
  submitting,
}: {
  ds: Declaration;
  onClose: () => void;
  onValider: (id: string) => void;
  onTransmettre: (id: string) => void;
  submitting: string | null;
}) {
  return (
    <aside
      className="fixed right-0 top-0 h-full flex flex-col bg-white border-l z-50"
      style={{
        width: 400,
        borderColor: "#cec3d1",
        boxShadow: "-4px 0 24px rgba(0,0,0,0.08)",
      }}
    >
      <div className="px-6 py-5 border-b" style={{ borderColor: "#f0edee" }}>
        <div className="flex items-start justify-between mb-1">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span
                className="material-symbols-outlined text-[18px]"
                style={{ color: "#8734bd" }}
              >
                verified_user
              </span>
              <h3 className="text-lg font-bold" style={{ color: "#3C0561" }}>
                {ds.ref}
              </h3>
            </div>
            <StatutBadge statut={ds.statut} />
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full transition-colors"
            style={{ color: "#7d7481" }}
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
        <Stepper statut={ds.statut} />
      </div>

      <div
        className="flex-1 overflow-y-auto p-6 space-y-5"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#ab78d1 transparent",
        }}
      >
        <section>
          <h4
            className="text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5"
            style={{ color: "#7d7481" }}
          >
            <span className="material-symbols-outlined text-[14px]">
              corporate_fare
            </span>
            Déclarant
          </h4>
          <div className="p-3 rounded-lg" style={{ background: "#f6f4fb" }}>
            <p className="text-sm font-bold" style={{ color: "#3C0561" }}>
              {ds.banque}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "#7d7481" }}>
              Responsable : {ds.agent}
            </p>
          </div>
        </section>

        <section>
          <h4
            className="text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5"
            style={{ color: "#7d7481" }}
          >
            <span className="material-symbols-outlined text-[14px]">
              person
            </span>
            Client concerné
          </h4>
          <div
            className="p-3 rounded-lg space-y-3"
            style={{ background: "#f6f4fb" }}
          >
            <div>
              <p
                className="text-[10px] font-bold uppercase tracking-widest mb-0.5"
                style={{ color: "#7d7481" }}
              >
                Identité
              </p>
              <p className="text-sm font-bold" style={{ color: "#3C0561" }}>
                {ds.client}
              </p>
            </div>
            <div className="pt-2 border-t" style={{ borderColor: "#e5e2e3" }}>
              <p
                className="text-[10px] font-bold uppercase tracking-widest mb-0.5"
                style={{ color: "#7d7481" }}
              >
                Montant Suspect
              </p>
              <p
                className="text-xl font-extrabold font-mono"
                style={{ color: "#8734bd" }}
              >
                {fmt(ds.montant)}{" "}
                <span
                  className="text-sm font-bold"
                  style={{ color: "#7d7481" }}
                >
                  XAF
                </span>
              </p>
            </div>
          </div>
        </section>

        {ds.statut === "Transmis" && ds.refAnif && (
          <section>
            <h4
              className="text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5"
              style={{ color: "#7d7481" }}
            >
              <span className="material-symbols-outlined text-[14px]">
                send
              </span>
              Transmission ANIF
            </h4>
            <div
              className="p-3 rounded-lg border space-y-3"
              style={{ borderColor: "#cec3d1" }}
            >
              <div className="flex justify-between items-center">
                <span className="text-xs" style={{ color: "#7d7481" }}>
                  Référence ANIF
                </span>
                <span
                  className="text-xs font-bold font-mono px-2 py-1 rounded"
                  style={{ background: "#f0edee", color: "#1b1b1c" }}
                >
                  {ds.refAnif}
                </span>
              </div>
              <div
                className="flex items-center gap-2 p-2 rounded"
                style={{ background: "rgba(60,5,97,0.05)" }}
              >
                <span
                  className="material-symbols-outlined text-[16px]"
                  style={{ color: "#3C0561" }}
                >
                  gavel
                </span>
                <span
                  className="text-[11px] font-bold"
                  style={{ color: "#3C0561" }}
                >
                  Art. 48 CEMAC Conformité Totale
                </span>
              </div>
            </div>
          </section>
        )}

        {/* Notice validation humaine */}
        {(ds.statut === "Brouillon" || ds.statut === "Validé") && (
          <section>
            <div
              className="p-3 rounded-lg"
              style={{
                background: "rgba(150,13,242,0.05)",
                border: "1px solid rgba(150,13,242,0.2)",
              }}
            >
              <p
                className="text-xs font-bold mb-1"
                style={{ color: "#960DF2" }}
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
                    fill="#AB3DF5"
                    stroke="#AB3DF5"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <line
                    x1="12"
                    y1="9"
                    x2="12"
                    y2="13"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <line
                    x1="12"
                    y1="17"
                    x2="12.01"
                    y2="17"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                Validation humaine obligatoire
              </p>
              <p className="text-[11px]" style={{ color: "#4c4450" }}>
                Conformément au Règlement CEMAC 01/03, aucune DS ne peut être
                transmise à l&apos;ANIF sans validation explicite.
              </p>
            </div>
          </section>
        )}

        {ds.statut === "Rejeté" && (
          <section>
            <div
              className="p-3 rounded-lg flex items-start gap-2"
              style={{
                background: "rgba(186,26,26,0.06)",
                border: "1px solid rgba(186,26,26,0.2)",
              }}
            >
              <span
                className="material-symbols-outlined text-[16px] mt-0.5"
                style={{ color: "#ba1a1a" }}
              >
                info
              </span>
              <div>
                <p
                  className="text-xs font-bold mb-0.5"
                  style={{ color: "#ba1a1a" }}
                >
                  Déclaration rejetée
                </p>
                <p className="text-[11px]" style={{ color: "#7d7481" }}>
                  Ce dossier a été rejeté. Veuillez le corriger et soumettre à
                  nouveau.
                </p>
              </div>
            </div>
          </section>
        )}
      </div>

      <div
        className="p-4 border-t space-y-2"
        style={{ borderColor: "#f0edee" }}
      >
        {ds.statut === "Brouillon" && (
          <button
            onClick={() => onValider(ds.id)}
            disabled={submitting === ds.id}
            className="w-full h-10 flex items-center justify-center gap-2 rounded-lg text-xs font-bold text-white transition-all disabled:opacity-50"
            style={{ background: "#3C0561" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#960DF2")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#3C0561")}
          >
            <span className="material-symbols-outlined text-[16px]">
              check_circle
            </span>
            {submitting === ds.id ? "Validation..." : "Valider la DS"}
          </button>
        )}
        {ds.statut === "Validé" && (
          <button
            onClick={() => onTransmettre(ds.id)}
            disabled={submitting === ds.id}
            className="w-full h-10 flex items-center justify-center gap-2 rounded-lg text-xs font-bold text-white transition-all disabled:opacity-50"
            style={{ background: "#10B981" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#059669")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#10B981")}
          >
            <span className="material-symbols-outlined text-[16px]">send</span>
            {submitting === ds.id ? "Transmission..." : "Transmettre à l'ANIF"}
          </button>
        )}
        <Link
          href={`/declarations/${ds.id}`}
          className="w-full h-10 flex items-center justify-center gap-2 rounded-lg text-xs font-bold transition-all"
          style={{ border: "1px solid #3C0561", color: "#3C0561" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "rgba(60,5,97,0.05)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
        >
          <span className="material-symbols-outlined text-[16px]">
            description
          </span>
          Voir le document complet
        </Link>
      </div>
    </aside>
  );
}

function Sidebar() {
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
      className="shrink-0 w-60 flex flex-col border-r"
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
            <div className="text-[10px] text-white/50 tracking-wider uppercase">
              Compliance Div
            </div>
          </div>
        </div>
      </div>
      <nav className="flex-1 py-6 overflow-y-auto">
        <div className="px-6 mb-2">
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">
            Surveillance
          </span>
        </div>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-6 py-2.5 text-xs font-medium tracking-wide transition-all"
            style={
              item.href === "/declarations"
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
      </nav>
      <div className="p-4 border-t" style={{ borderColor: "#2e004e" }}>
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded flex items-center justify-center font-bold text-sm text-white shrink-0"
            style={{ background: "#2e004e" }}
          >
            JM
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">J. Mbida</p>
            <p className="text-[10px] text-white/50 truncate uppercase">
              Officier Conformité
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function DeclarationsPage() {
  const [declarations, setDeclarations] = useState<Declaration[]>([]);
  const [alertes, setAlertes] = useState<ApiAlerte[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Declaration | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<DSStatut | "Tous">("Tous");
  const [time, setTime] = useState("");
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [generating, setGenerating] = useState<string | null>(null);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("siarf_token") : null;

  const fetchDeclarations = async () => {
    if (!token) return;
    const res = await fetch(
      "http://localhost:8000/api/v1/declarations/?limit=100",
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    const data = await res.json();
    const mapped: Declaration[] = (data.declarations ?? []).map(
      (d: {
        id: string;
        reference: string;
        created_at: string;
        client_nom: string;
        montant_operation: string;
        statut: string;
        reference_anif?: string;
      }) => ({
        id: d.id,
        ref: d.reference,
        date: new Date(d.created_at).toLocaleDateString("fr-FR"),
        client: d.client_nom ?? "Client SIARF",
        montant: parseFloat(
          (d.montant_operation ?? "0").replace(/[^0-9.]/g, ""),
        ),
        statut:
          d.statut === "transmise"
            ? "Transmis"
            : d.statut === "en_attente"
              ? "Validé"
              : d.statut === "brouillon"
                ? "Brouillon"
                : ("Rejeté" as DSStatut),
        refAnif: d.reference_anif,
        banque: "Afriland First Bank",
        agent: "J. Mbida",
        devise: "XAF",
      }),
    );
    setDeclarations(mapped);
    setLoading(false);
  };

  const fetchAlertes = async () => {
    if (!token) return;
    const res = await fetch("http://localhost:8000/api/v1/alertes/?limit=100", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setAlertes(data.alertes ?? []);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDeclarations();
    fetchAlertes();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const genererDS = async (alerteId: string) => {
    if (!token) return;
    setGenerating(alerteId);
    try {
      const res = await fetch(
        `http://localhost:8000/api/v1/declarations/generer/${alerteId}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!res.ok) {
        const err = await res.json();
        alert(err.detail ?? "Erreur génération DS");
        return;
      }
      await fetchDeclarations();
      await fetchAlertes();
      setShowModal(false);
    } finally {
      setGenerating(null);
    }
  };

  const validerDS = async (id: string) => {
    if (!token) return;
    setSubmitting(id);
    try {
      await fetch(`http://localhost:8000/api/v1/declarations/${id}/valider`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchDeclarations();
      setSelected((prev) => (prev ? { ...prev, statut: "Validé" } : null));
    } finally {
      setSubmitting(null);
    }
  };

  const transmettreDS = async (id: string) => {
    if (!token) return;
    setSubmitting(id);
    try {
      const res = await fetch(
        `http://localhost:8000/api/v1/declarations/${id}/transmettre`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      await fetchDeclarations();
      setSelected((prev) =>
        prev
          ? { ...prev, statut: "Transmis", refAnif: data.reference_anif }
          : null,
      );
    } finally {
      setSubmitting(null);
    }
  };

  const filtered = declarations.filter((d) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      d.ref.toLowerCase().includes(q) ||
      d.client.toLowerCase().includes(q);
    const matchFilter = filter === "Tous" || d.statut === filter;
    return matchSearch && matchFilter;
  });

  const stats = {
    transmises: declarations.filter((d) => d.statut === "Transmis").length,
    attente: declarations.filter(
      (d) => d.statut === "Validé" || d.statut === "Brouillon",
    ).length,
    rejetees: declarations.filter((d) => d.statut === "Rejeté").length,
    montant: declarations.reduce(
      (s, d) => s + (isNaN(d.montant) ? 0 : d.montant),
      0,
    ),
  };

  return (
    <>
      <style>{`
        @keyframes slide-panel { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:none; } }
        .panel-anim { animation: slide-panel 0.25s ease forwards; }
      `}</style>

      <div
        className="h-screen w-screen flex overflow-hidden"
        style={{
          background: "#fcf8f9",
          fontFamily: "Inter, sans-serif",
          color: "#1b1b1c",
        }}
      >
        <Sidebar />

        <div
          className="flex-1 flex flex-col min-w-0"
          style={{
            marginRight: selected ? 400 : 0,
            transition: "margin-right 0.3s ease",
          }}
        >
          <header
            className="h-16 bg-white flex items-center justify-between px-8 border-b shrink-0"
            style={{ borderColor: "#f0edee" }}
          >
            <div>
              <h2
                className="text-lg font-bold tracking-tight"
                style={{ color: "#1b1b1c" }}
              >
                Historique des Déclarations de Soupçon
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                <span
                  className="text-xs font-medium"
                  style={{ color: "#7d7481" }}
                >
                  Transmissions ANIF — {time} UTC
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                className="relative w-9 h-9 flex items-center justify-center rounded-lg"
                style={{ color: "#7d7481" }}
              >
                <span className="material-symbols-outlined text-[20px]">
                  notifications
                </span>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#ba1a1a] rounded-full border-2 border-white" />
              </button>
              <div
                className="w-8 h-8 rounded flex items-center justify-center font-bold text-xs text-white"
                style={{ background: "#3C0561" }}
              >
                JM
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
            <div className="max-w-350 mx-auto space-y-5">
              {/* KPIs */}
              <div className="grid grid-cols-4 gap-5">
                {[
                  {
                    label: "Total Transmises",
                    value: loading ? "—" : stats.transmises,
                    color: "#166534",
                    bg: "rgba(22,101,52,0.06)",
                    icon: "check_circle",
                  },
                  {
                    label: "En Attente ANIF",
                    value: loading ? "—" : stats.attente,
                    color: "#8734bd",
                    bg: "rgba(135,52,189,0.06)",
                    icon: "schedule",
                  },
                  {
                    label: "Rejetées",
                    value: loading ? "—" : stats.rejetees,
                    color: "#ba1a1a",
                    bg: "rgba(186,26,26,0.06)",
                    icon: "error",
                  },
                  {
                    label: "Montant Cumulé",
                    value: loading
                      ? "—"
                      : `${(stats.montant / 1e6).toFixed(1)}M XAF`,
                    color: "#3C0561",
                    bg: "rgba(60,5,97,0.06)",
                    icon: "payments",
                  },
                ].map((kpi) => (
                  <div
                    key={kpi.label}
                    className="bg-white rounded-lg p-5 flex items-center justify-between"
                    style={{ border: "1px solid #f0edee" }}
                  >
                    <div>
                      <p
                        className="text-[10px] font-bold uppercase tracking-widest mb-2"
                        style={{ color: "#7d7481" }}
                      >
                        {kpi.label}
                      </p>
                      <p
                        className="text-2xl font-bold tracking-tight"
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

              {/* Filtres */}
              <div
                className="bg-white rounded-lg px-4 py-3 flex items-center justify-between"
                style={{ border: "1px solid #f0edee" }}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <span
                      className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[16px]"
                      style={{ color: "#7d7481" }}
                    >
                      search
                    </span>
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Référence, client..."
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
                  <select
                    value={filter}
                    onChange={(e) =>
                      setFilter(e.target.value as DSStatut | "Tous")
                    }
                    className="h-9 px-3 text-xs rounded-lg outline-none cursor-pointer font-medium"
                    style={{
                      border: "1px solid #cec3d1",
                      color: "#1b1b1c",
                      background: "white",
                    }}
                  >
                    <option value="Tous">Tous les statuts</option>
                    <option value="Transmis">Transmis</option>
                    <option value="Validé">Validé</option>
                    <option value="Brouillon">Brouillon</option>
                    <option value="Rejeté">Rejeté</option>
                  </select>
                  {filtered.length !== declarations.length && (
                    <span
                      className="text-xs font-medium"
                      style={{ color: "#7d7481" }}
                    >
                      {filtered.length} résultat{filtered.length > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setShowModal(true)}
                  className="h-9 px-4 flex items-center gap-2 text-xs font-bold rounded-lg text-white transition-all"
                  style={{ background: "#3C0561" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#960DF2")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "#3C0561")
                  }
                >
                  <span className="material-symbols-outlined text-[15px]">
                    add
                  </span>
                  Nouvelle Déclaration
                </button>
              </div>

              {/* Table */}
              <div
                className="bg-white rounded-lg overflow-hidden"
                style={{ border: "1px solid #f0edee" }}
              >
                {loading ? (
                  <div className="py-20 flex flex-col items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full border-2 animate-spin"
                      style={{
                        borderColor: "#960DF2",
                        borderTopColor: "transparent",
                      }}
                    />
                    <p
                      className="text-xs font-bold uppercase tracking-widest"
                      style={{ color: "#7d7481" }}
                    >
                      Chargement...
                    </p>
                  </div>
                ) : (
                  <table
                    className="w-full text-left"
                    style={{ borderCollapse: "collapse" }}
                  >
                    <thead>
                      <tr
                        style={{
                          background: "rgba(240,237,238,0.5)",
                          borderBottom: "2px solid #3C0561",
                        }}
                      >
                        {[
                          "Référence",
                          "Date",
                          "Client / Entité",
                          "Montant",
                          "Statut",
                          "",
                        ].map((h) => (
                          <th
                            key={h}
                            className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em]"
                            style={{ color: "#3C0561" }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-16 text-center">
                            <p
                              className="text-xs font-bold uppercase tracking-widest mb-3"
                              style={{ color: "#7d7481" }}
                            >
                              Aucune déclaration trouvée
                            </p>
                            <button
                              onClick={() => setShowModal(true)}
                              className="px-4 py-2 rounded-lg text-white text-xs font-bold"
                              style={{ background: "#3C0561" }}
                            >
                              Générer la première DS
                            </button>
                          </td>
                        </tr>
                      ) : (
                        filtered.map((ds, i) => {
                          const isSelected = selected?.id === ds.id;
                          return (
                            <tr
                              key={ds.id}
                              onClick={() =>
                                setSelected(isSelected ? null : ds)
                              }
                              className="cursor-pointer transition-all"
                              style={{
                                borderTop:
                                  i > 0 ? "1px solid #f0edee" : undefined,
                                background: isSelected
                                  ? "rgba(150,13,242,0.04)"
                                  : undefined,
                                borderLeft: isSelected
                                  ? "4px solid #960DF2"
                                  : "4px solid transparent",
                              }}
                              onMouseEnter={(e) =>
                                !isSelected &&
                                ((
                                  e.currentTarget as HTMLTableRowElement
                                ).style.background = "#faf8ff")
                              }
                              onMouseLeave={(e) =>
                                !isSelected &&
                                ((
                                  e.currentTarget as HTMLTableRowElement
                                ).style.background = "")
                              }
                            >
                              <td className="px-6 py-4">
                                <span
                                  className="font-mono font-bold text-xs"
                                  style={{ color: "#960DF2" }}
                                >
                                  {ds.ref}
                                </span>
                              </td>
                              <td
                                className="px-6 py-4 text-xs"
                                style={{ color: "#7d7481" }}
                              >
                                {ds.date}
                              </td>
                              <td
                                className="px-6 py-4 text-xs font-semibold"
                                style={{ color: "#1b1b1c" }}
                              >
                                {ds.client}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <span
                                  className="font-mono font-bold text-xs"
                                  style={{ color: "#3C0561" }}
                                >
                                  {fmt(isNaN(ds.montant) ? 0 : ds.montant)}
                                </span>
                                <span
                                  className="text-[10px] ml-1"
                                  style={{ color: "#7d7481" }}
                                >
                                  XAF
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <StatutBadge statut={ds.statut} />
                              </td>
                              <td className="px-6 py-4 text-right">
                                <span
                                  className="material-symbols-outlined text-[20px]"
                                  style={{
                                    color: isSelected ? "#960DF2" : "#7d7481",
                                  }}
                                >
                                  chevron_right
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                )}
              </div>

              <div
                className="flex items-center justify-between py-2 text-[10px] font-bold uppercase tracking-widest"
                style={{ color: "#7d7481" }}
              >
                <span>
                  {filtered.length} déclaration{filtered.length > 1 ? "s" : ""}{" "}
                  affichée{filtered.length > 1 ? "s" : ""}
                </span>
                <div
                  className="flex items-center gap-2"
                  style={{ color: "#10B981" }}
                >
                  <span>Tunnel ANIF Sécurisé</span>
                  <span className="material-symbols-outlined text-[14px]">
                    lock
                  </span>
                </div>
              </div>
            </div>
          </main>
        </div>

        {/* Panneau latéral */}
        {selected && (
          <div className="panel-anim">
            <PreviewPanel
              ds={selected}
              onClose={() => setSelected(null)}
              onValider={validerDS}
              onTransmettre={transmettreDS}
              submitting={submitting}
            />
          </div>
        )}

        {/* Modal — Générer DS depuis alerte */}
        {showModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.5)" }}
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
              <div
                className="p-6 border-b flex items-center justify-between"
                style={{ borderColor: "#f0edee" }}
              >
                <div>
                  <h3
                    className="text-lg font-bold"
                    style={{ color: "#1b1b1c" }}
                  >
                    Générer une Déclaration de Soupçon
                  </h3>
                  <p className="text-xs mt-1" style={{ color: "#7d7481" }}>
                    Sélectionnez une alerte — SIARF IA génère automatiquement la
                    DS en moins de 2 minutes
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  style={{ color: "#7d7481" }}
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-3">
                {alertes.length === 0 ? (
                  <p
                    className="text-center text-xs font-bold uppercase tracking-widest py-8"
                    style={{ color: "#7d7481" }}
                  >
                    Aucune alerte disponible
                  </p>
                ) : (
                  alertes.map((a) => (
                    <div
                      key={a.id}
                      className="p-4 rounded-xl border"
                      style={{
                        borderColor:
                          a.score_risque >= 70 ? "#ba1a1a" : "#cec3d1",
                        borderLeft: `4px solid ${a.score_risque >= 70 ? "#ba1a1a" : "#960DF2"}`,
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p
                            className="font-mono font-bold text-xs mb-1"
                            style={{ color: "#960DF2" }}
                          >
                            {a.reference}
                          </p>
                          <p className="text-xs" style={{ color: "#4c4450" }}>
                            Score AML :
                            <span
                              className="font-bold ml-1"
                              style={{
                                color:
                                  a.score_risque >= 70 ? "#ba1a1a" : "#D97706",
                              }}
                            >
                              {a.score_risque}/100
                            </span>
                            {" · "}
                            {new Intl.NumberFormat("fr-FR").format(
                              a.signaux?.montant ?? 0,
                            )}{" "}
                            XAF
                            {" · "}
                            <span className="capitalize">
                              {a.statut.replace("_", " ")}
                            </span>
                          </p>
                        </div>
                        <button
                          onClick={() => genererDS(a.id)}
                          disabled={generating === a.id}
                          className="h-9 px-4 rounded-lg text-white text-xs font-bold transition-all disabled:opacity-50"
                          style={{ background: "#3C0561" }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background = "#960DF2")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "#3C0561")
                          }
                        >
                          {generating === a.id
                            ? "Génération IA..."
                            : "Générer DS"}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
