"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

// ─── Types ───────────────────────────────────────────
interface Step1Data { codeActivation: string; }
interface Step2Data { nom: string; prenom: string; email: string; telephone: string; }
interface Step3Data { password: string; confirmation: string; twoFA: "sms" | "app"; accepte: boolean; }

// ─── Helpers validation ──────────────────────────────
const validateCode = (v: string) => /^[A-Z]{2}-\d{4}-[A-Z]{3}-\d{4}$/.test(v.toUpperCase());
const validateEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const validateTel = (v: string) => /^\+?\d{8,15}$/.test(v.replace(/\s/g, ""));
const passwordChecks = (p: string) => ({
  length: p.length >= 12,
  upper: /[A-Z]/.test(p) && /[a-z]/.test(p),
  number: /\d/.test(p),
  special: /[!@#$%^&*]/.test(p),
});
const passwordStrength = (p: string) => Object.values(passwordChecks(p)).filter(Boolean).length;

// ─── Composants réutilisables ────────────────────────
function StepDot({ done, active, num }: { done: boolean; active: boolean; num: number }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold transition-all"
        style={{
          background: done ? "var(--siarf-500)" : active ? "var(--siarf-700)" : "#cec3d1",
        }}
      >
        {done ? (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        ) : num}
      </div>
      {num < 3 && (
        <div className="w-0.5 flex-1 mt-2 min-h-8"
          style={{ background: done ? "var(--siarf-300)" : "#e5e2e3" }} />
      )}
    </div>
  );
}

 function Field({
  label, children, valid, error, touched,
}: {
  label: string;
  children: React.ReactNode;
  valid?: boolean;
  error?: string;
  touched?: boolean;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-[10px] font-bold uppercase tracking-widest ml-1"
        style={{ color: "#7d7481" }}>
        {label}
      </label>
      {children}
      {touched && !valid && error && (
        <p className="text-[11px] text-red-600 ml-1">{error}</p>
      )}
    </div>
  );
}

function Input({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  valid, touched, error, ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { valid?: boolean; touched?: boolean; error?: string }) {
  const borderColor = !touched ? "#cec3d1" : valid ? "var(--siarf-400)" : "#ba1a1a";
  const bg = !touched ? "#fafafa" : valid ? "#f5f0ff" : "#fff5f5";

  return (
    <div className="relative">
      <input
        {...props}
        className="block w-full h-10 px-4 rounded outline-none transition-all text-sm pr-10"
        style={{ border: `1.5px solid ${borderColor}`, background: bg, color: "#1b1b1c" }}
      />
      {touched && valid && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <svg className="w-4 h-4" style={{ color: "var(--siarf-500)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
      {touched && !valid && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      )}
    </div>
  );
}

// ─── Étape 1 — Code d'activation ────────────────────
function Step1({ onNext }: { onNext: (d: Step1Data) => void }) {
  const [code, setCode] = useState("");
  const [touched, setTouched] = useState(false);
  const valid = validateCode(code);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: "#7d7481" }}>
          Section 1 — Code d&apos;activation
        </h3>
        <p className="text-sm" style={{ color: "#4c4450" }}>
          Saisissez le code fourni par votre établissement bancaire (format : XX-0000-XXX-0000).
        </p>
      </div>

      <Field label="Code d'activation" valid={valid} touched={touched}
        error="Format invalide. Exemple : AS-9982-KLA-2024">
        <Input
          type="text"
          placeholder="XX-0000-XXX-0000"
          value={code}
          valid={valid}
          touched={touched}
          onChange={e => { setCode(e.target.value.toUpperCase()); setTouched(true); }}
          className="font-mono tracking-widest uppercase"
        />
      </Field>

      {valid && (
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
          style={{ background: "rgba(150,13,242,0.08)", color: "var(--siarf-600)" }}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Code valide — Afriland First Bank
        </div>
      )}

      <button
        onClick={() => valid && onNext({ codeActivation: code })}
        disabled={!valid}
        className="w-full h-11 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-40"
        style={{ background: "var(--siarf-700)", color: "white" }}
      >
        Continuer →
      </button>
    </div>
  );
}

// ─── Étape 2 — Informations personnelles ────────────
function Step2({ onNext, onBack }: { onNext: (d: Step2Data) => void; onBack: () => void }) {
  const [form, setForm] = useState({ nom: "", prenom: "", email: "", telephone: "" });
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [k]: e.target.value }));
    setTouched(t => ({ ...t, [k]: true }));
  };

  const validity = {
    nom: form.nom.trim().length >= 2,
    prenom: form.prenom.trim().length >= 2,
    email: validateEmail(form.email),
    telephone: validateTel(form.telephone),
  };

  const allValid = Object.values(validity).every(Boolean);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: "#7d7481" }}>
          Section 2 — Informations personnelles
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Nom" valid={validity.nom} touched={touched.nom} error="Minimum 2 caractères">
          <Input type="text" placeholder="MBIDA" value={form.nom}
            valid={validity.nom} touched={touched.nom} error="Minimum 2 caractères"
            onChange={set("nom")} />
        </Field>
        <Field label="Prénom" valid={validity.prenom} touched={touched.prenom} error="Minimum 2 caractères">
          <Input type="text" placeholder="Jean-Paul" value={form.prenom}
            valid={validity.prenom} touched={touched.prenom} error="Minimum 2 caractères"
            onChange={set("prenom")} />
        </Field>
      </div>

      <Field label="Email Professionnel" valid={validity.email} touched={touched.email} error="Email invalide">
        <Input type="email" placeholder="prenom.nom@banque.cm" value={form.email}
          valid={validity.email} touched={touched.email} error="Email invalide"
          onChange={set("email")} />
      </Field>

      <Field label="Téléphone" valid={validity.telephone} touched={touched.telephone} error="Numéro invalide">
        <Input type="tel" placeholder="+237 6XX XX XX XX" value={form.telephone}
          valid={validity.telephone} touched={touched.telephone} error="Numéro invalide"
          onChange={set("telephone")} />
      </Field>

      <div className="flex gap-3 pt-2">
        <button onClick={onBack}
          className="h-11 px-6 rounded-xl font-semibold text-sm border transition-all"
          style={{ borderColor: "#cec3d1", color: "#4c4450" }}>
          ← Retour
        </button>
        <button
          onClick={() => allValid && onNext(form)}
          disabled={!allValid}
          className="flex-1 h-11 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-40"
          style={{ background: "var(--siarf-700)", color: "white" }}
        >
          Continuer →
        </button>
      </div>
    </div>
  );
}

// ─── Étape 3 — Sécurité & Finalisation ──────────────
function Step3({
  onSubmit, onBack, loading,
}: {
  onSubmit: (d: Step3Data) => void;
  onBack: () => void;
  loading: boolean;
}) {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [twoFA, setTwoFA] = useState<"sms" | "app">("sms");
  const [accepte, setAccepte] = useState(false);
  const [touchedPwd, setTouchedPwd] = useState(false);
  const [touchedConf, setTouchedConf] = useState(false);

  const checks = passwordChecks(password);
  const strength = passwordStrength(password);
  const strengthLabels = ["", "Faible", "Moyen", "Bon", "Fort"];
  const strengthColors = ["", "#ba1a1a", "#D97706", "#8734bd", "var(--siarf-500)"];

  const pwdValid = strength === 4;
  const confValid = password === confirmation && confirmation.length > 0;
  const canSubmit = pwdValid && confValid && accepte;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: "#7d7481" }}>
          Section 3 — Sécurité & Accès
        </h3>
      </div>

      {/* Mot de passe */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Mot de passe" valid={pwdValid} touched={touchedPwd}>
          <div className="relative">
            <Input
              type={showPwd ? "text" : "password"}
              placeholder="••••••••••••"
              value={password}
              valid={pwdValid}
              touched={touchedPwd}
              onChange={e => { setPassword(e.target.value); setTouchedPwd(true); }}
              className="pr-10"
            />
            <button type="button" onClick={() => setShowPwd(s => !s)}
              className="absolute right-8 top-1/2 -translate-y-1/2"
              style={{ color: "#7d7481" }}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {showPwd
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                }
              </svg>
            </button>
          </div>
        </Field>

        <Field label="Confirmation" valid={confValid} touched={touchedConf}
          error="Les mots de passe ne correspondent pas">
          <Input
            type="password"
            placeholder="••••••••••••"
            value={confirmation}
            valid={confValid}
            touched={touchedConf}
            error="Les mots de passe ne correspondent pas"
            onChange={e => { setConfirmation(e.target.value); setTouchedConf(true); }}
          />
        </Field>
      </div>

      {/* Indicateur de force */}
      {touchedPwd && (
        <div className="p-4 rounded-lg border" style={{ background: "#f6f3f4", borderColor: "#cec3d1" }}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold uppercase" style={{ color: "#4c4450" }}>Force du mot de passe</span>
            {strength > 0 && (
              <span className="text-xs font-bold" style={{ color: strengthColors[strength] }}>
                {strengthLabels[strength]}
              </span>
            )}
          </div>
          <div className="flex gap-1.5 h-1.5 mb-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex-1 rounded-full transition-all"
                style={{ background: i <= strength ? strengthColors[strength] : "#e5e2e3" }} />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-y-2">
            {[
              { key: "length", label: "Min. 12 caractères" },
              { key: "upper", label: "Majuscule & Minuscule" },
              { key: "number", label: "Chiffre (0-9)" },
              { key: "special", label: "Caractère spécial (!@#)" },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center gap-2 text-[11px]"
                style={{ color: checks[key as keyof typeof checks] ? "var(--siarf-500)" : "#7d7481" }}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {checks[key as keyof typeof checks]
                    ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  }
                </svg>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2FA */}
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "#7d7481" }}>
          Double Authentification (2FA)
        </label>
        <div className="flex gap-3">
          {(["sms", "app"] as const).map(option => (
            <button key={option} type="button"
              onClick={() => option === "sms" && setTwoFA(option)}
              className={`flex-1 flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left ${option === "app" ? "opacity-50 cursor-not-allowed" : ""}`}
              style={{
                borderColor: twoFA === option ? "var(--siarf-500)" : "#cec3d1",
                background: twoFA === option ? "rgba(150,13,242,0.05)" : "white",
              }}>
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" style={{ color: twoFA === option ? "var(--siarf-500)" : "#7d7481" }}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {option === "sms"
                    ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  }
                </svg>
                <div>
                  <p className="font-bold text-sm" style={{ color: "#1b1b1c" }}>
                    {option === "sms" ? "Code via SMS" : "Authenticator App"}
                  </p>
                  <p className="text-[10px]" style={{ color: "#7d7481" }}>
                    {option === "sms" ? "Recommandé" : "Configuration requise"}
                  </p>
                </div>
              </div>
              <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                style={{ borderColor: twoFA === option ? "var(--siarf-500)" : "#cec3d1" }}>
                {twoFA === option && (
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--siarf-500)" }} />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Consentement */}
      <div className="flex items-start gap-3 pt-2">
        <input type="checkbox" id="accepte" checked={accepte}
          onChange={e => setAccepte(e.target.checked)}
          className="mt-1 w-4 h-4 rounded cursor-pointer"
          style={{ accentColor: "var(--siarf-500)" }} />
        <label htmlFor="accepte" className="text-sm cursor-pointer" style={{ color: "#4c4450" }}>
          Je confirme avoir pris connaissance de la{" "}
          <a href="#" className="underline font-medium" style={{ color: "var(--siarf-500)" }}>
            Charte de Conformité et de Déontologie
          </a>{" "}
          de la plateforme SIARF.
        </label>
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={onBack}
          className="h-11 px-6 rounded-xl font-semibold text-sm border transition-all"
          style={{ borderColor: "#cec3d1", color: "#4c4450" }}>
          ← Retour
        </button>
        <button
          onClick={() => canSubmit && onSubmit({ password, confirmation, twoFA, accepte })}
          disabled={!canSubmit || loading}
          className="flex-1 h-11 rounded-xl font-bold text-sm transition-all duration-200 disabled:opacity-40 flex items-center justify-center gap-2"
          style={{ background: "var(--siarf-700)", color: "white" }}
        >
          {loading ? "Création en cours..." : "Créer mon compte"}
          {!loading && (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Page principale ─────────────────────────────────
export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null);
  const [step2Data, setStep2Data] = useState<Step2Data | null>(null);

  const handleSubmit = async (step3: Step3Data) => {
    setLoading(true);
    // TODO: appel API POST /auth/register
    console.log({ ...step1Data, ...step2Data, ...step3 });
    await new Promise(r => setTimeout(r, 1500));
    router.push("/auth/login");
    setLoading(false);
  };

  const stepLabels = ["Code d'activation", "Informations", "Sécurité"];

  return (
    <div className="h-screen flex overflow-hidden" style={{ background: "#fcf8f9" }}>

      {/* ── Colonne gauche — Branding ── */}
      <section
        className="hidden lg:flex flex-col justify-between w-1/3 p-12 relative overflow-hidden shrink-0"
        style={{ background: "linear-gradient(160deg, var(--siarf-700) 0%, var(--siarf-500) 100%)" }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,0.12) 0.5px, transparent 0.5px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-12 w-12 rounded-xl flex items-center justify-center font-bold text-xl">
                             <Image
                               src="/image/logoSIARF.png"
                               alt="Logo SIARF"
                               width={180}
                               height={180}
                               className="object-contain"
                             />
                           </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">SIARF</h1>
          </div>

          <p className="text-sm leading-relaxed mb-10" style={{ color: "rgba(234,207,252,0.85)" }}>
            Système Intéligent d&apos;Analyse des Risques Financiers. Portail d&apos;accès sécurisé
            aux missions de surveillance et de lutte contre le blanchiment d&apos;argent.
          </p>

          {/* Progression visuelle */}
          <div className="space-y-4">
            {stepLabels.map((label, i) => {
              const n = i + 1;
              const done = step > n;
              const active = step === n;
              return (
                <div key={n} className="flex items-center gap-3">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all"
                    style={{
                      background: done ? "rgba(255,255,255,0.9)" : active ? "white" : "rgba(255,255,255,0.2)",
                      color: done || active ? "var(--siarf-700)" : "rgba(255,255,255,0.6)",
                    }}
                  >
                    {done ? "✓" : n}
                  </div>
                  <span
                    className="text-xs font-medium uppercase tracking-wide transition-all"
                    style={{ color: done || active ? "white" : "rgba(255,255,255,0.4)" }}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative z-10">
          <div className="p-5 rounded-xl mb-6"
            style={{ background: "rgba(0,0,0,0.2)", borderLeft: "3px solid rgba(192,110,247,0.8)" }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-2"
              style={{ color: "var(--siarf-100)" }}>
              Sécurité Certifiée
            </p>
            <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>
              Protocole de cryptage conforme aux standards bancaires internationaux.
            </p>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-mono" style={{ color: "rgba(234,207,252,0.5)" }}>
            <span>© 2026 SIARF</span>
            <span className="w-1 h-1 rounded-full" style={{ background: "rgba(234,207,252,0.3)" }} />
            <span>v1.0.0</span>
          </div>
        </div>
      </section>

      {/* ── Zone formulaire ── */}
      <main className="flex-1 flex flex-col items-center justify-start py-10 px-6 overflow-y-auto"
        style={{ scrollbarWidth: "thin", scrollbarColor: "#ab78d1 transparent" }}>
        <div className="w-full max-w-xl">

          {/* Header */}
          <div className="mb-8 flex justify-between items-end">
            <div>
              <h2 className="text-3xl font-bold mb-1" style={{ color: "var(--siarf-700)" }}>
                Création de compte
              </h2>
              <p className="text-sm" style={{ color: "#4c4450" }}>
                Étape {step}/3 — {stepLabels[step - 1]}
              </p>
            </div>
            {/* Barre de progression */}
            <div className="flex gap-1.5">
              {[1, 2, 3].map(n => (
                <div key={n} className="h-1.5 w-8 rounded-full transition-all"
                  style={{ background: step >= n ? "var(--siarf-500)" : "#e5e2e3" }} />
              ))}
            </div>
          </div>

          {/* Étapes */}
          <div className="flex gap-5 mb-8">
            <StepDot done={step > 1} active={step === 1} num={1} />
            <div className="flex-1 pb-8">
              {step === 1 && (
                <Step1 onNext={d => { setStep1Data(d); setStep(2); }} />
              )}
              {step !== 1 && (
                <div className="h-10 flex items-center gap-2 text-sm font-medium"
                  style={{ color: "var(--siarf-500)" }}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  Code activé — {step1Data?.codeActivation}
                </div>
              )}
            </div>
          </div>

          {step >= 2 && (
            <div className="flex gap-5 mb-8">
              <StepDot done={step > 2} active={step === 2} num={2} />
              <div className="flex-1 pb-8">
                {step === 2 && (
                  <Step2
                    onNext={d => { setStep2Data(d); setStep(3); }}
                    onBack={() => setStep(1)}
                  />
                )}
                {step > 2 && (
                  <div className="h-10 flex items-center gap-2 text-sm font-medium"
                    style={{ color: "var(--siarf-500)" }}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    {step2Data?.prenom} {step2Data?.nom} — {step2Data?.email}
                  </div>
                )}
              </div>
            </div>
          )}

          {step >= 3 && (
            <div className="flex gap-5">
              <StepDot done={false} active={true} num={3} />
              <div className="flex-1 pb-8">
                <Step3
                  onSubmit={handleSubmit}
                  onBack={() => setStep(2)}
                  loading={loading}
                />
              </div>
            </div>
          )}

          <p className="text-center mt-6 text-xs" style={{ color: "#4c4450" }}>
            Déjà inscrit ?{" "}
            <a href="/login" className="font-bold hover:underline" style={{ color: "var(--siarf-700)" }}>
              Connectez-vous
            </a>
          </p>
        </div>
      </main>

      {/* Bouton support */}
      <button
        className="fixed bottom-8 right-8 w-12 h-12 rounded-full flex items-center justify-center shadow-xl transition-all hover:-translate-y-0.5"
        style={{ background: "white", border: "1px solid #cec3d1", color: "var(--siarf-700)" }}
        title="Support"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
    </div>
  );
}