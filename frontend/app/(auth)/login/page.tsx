"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totp, setTotp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

 const handleLogin = async () => {
  setLoading(true);
  setError("");

  try {
    const res = await fetch("http://localhost:8000/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.detail ?? "Erreur de connexion");
      return;
    }

    // Stocker le token et les infos utilisateur
    localStorage.setItem("siarf_token", data.access_token);
    localStorage.setItem("siarf_user", JSON.stringify(data.user));
    localStorage.setItem("siarf_banque", JSON.stringify(data.banque));

    router.push("/dashboard");

  } catch {
    setError("Impossible de contacter le serveur. Vérifiez que le backend est lancé.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{ backgroundColor: "#fcf8f9", color: "#1b1b1c" }}
    >
      <main className="flex-1 flex items-center justify-center px-4 py-4 overflow-hidden">
        <div
          className="flex flex-col md:flex-row w-full max-w-5xl overflow-hidden rounded-2xl shadow-2xl"
          style={{
            border: "1px solid transparent",
            backgroundImage:
              "linear-gradient(white, white), radial-gradient(circle at top left, var(--siarf-700), var(--siarf-100))",
            backgroundOrigin: "border-box",
            backgroundClip: "content-box, border-box",
            maxHeight: "calc(100vh - 2rem)",
          }}
        >
          {/* ── Colonne gauche — Branding ── */}
          <div
            className="hidden md:flex flex-col justify-between w-5/12 p-8 relative overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, var(--siarf-700) 0%, var(--siarf-500) 100%)",
            }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(rgba(255,255,255,0.15) 0.5px, transparent 0.5px)",
                backgroundSize: "24px 24px",
              }}
            />

            <div className="relative z-10">
              {/* Logo */}
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-xl flex items-center justify-center font-bold text-xl">
                  <Image
                    src="/image/logoSIARF.png"
                    alt="Logo SIARF"
                    width={180}
                    height={180}
                    className="object-contain"
                  />
                </div>
                <h1
                  className="font-bold tracking-widest text-4xl"
                  style={{ color: "white" }}
                >
                  SIARF
                </h1>
              </div>

              <p
                className="mb-8 leading-relaxed text-sm"
                style={{ color: "rgba(234,207,252,0.85)" }}
              >
                L&apos;analyse intelligente au service de la confiance
                financière. Accès restreint au personnel autorisé de la CEMAC.
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: "rgba(255,255,255,0.12)" }}
                  >
                    <svg
                      className="w-4 h-4"
                      style={{ color: "var(--siarf-100)" }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  </div>
                  <span
                    className="text-xs font-medium uppercase tracking-wide"
                    style={{ color: "rgba(255,255,255,0.9)" }}
                  >
                    Connexion Chiffrée de Bout en Bout
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: "rgba(255,255,255,0.12)" }}
                  >
                    <svg
                      className="w-4 h-4"
                      style={{ color: "var(--siarf-100)" }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <span
                    className="text-xs font-medium uppercase tracking-wide"
                    style={{ color: "rgba(255,255,255,0.9)" }}
                  >
                    Conforme aux Normes GAFI
                  </span>
                </div>
              </div>
            </div>
            {/* Illustration */}
            <div className="relative z-10 mt-6">
              <div className="relative z-10 mt-6">
                <Image
                  src="/image/loginImage.jfif"
                  alt="Sécurité financière SIARF"
                  width={400}
                  height={400}
                   className="w-full h-40 rounded-xl object-cover"
                  style={{ border: "1px solid rgba(255,255,255,0.12)" }}
                />
              </div>
            </div>

            {/* Badges bas colonne gauche */}
            <div
              className="relative z-10 pt-6 mt-6 flex justify-between items-center opacity-60"
              style={{ borderTop: "1px solid rgba(255,255,255,0.15)" }}
            >
              <div className="flex items-center gap-1">
                <svg
                  className="w-3 h-3 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                  />
                </svg>
                <span className="text-[9px] font-bold uppercase tracking-widest text-white">
                  CEMAC Certified
                </span>
              </div>

              <div className="flex items-center gap-1">
                <svg
                  className="w-3 h-3 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <span className="text-[9px] font-bold uppercase tracking-widest text-white">
                  Safe & Secure
                </span>
              </div>
            </div>
          </div>

          {/* ── Colonne droite — Formulaire ── */}
          <div className="w-full md:w-7/12 p-8 flex flex-col justify-center bg-white">
            <div className="mb-6">
              <h2
                className="font-semibold mb-2 tracking-wide text-2xl"
                style={{ color: "#1b1b1c" }}
              >
                Authentification Requise
              </h2>
              <p className="text-sm" style={{ color: "#4c4450" }}>
                Veuillez entrer vos identifiants institutionnels pour accéder au
                portail SIARF.
              </p>
              {error && (
                <div className="text-red-500 text-sm">{error}</div>
              )}
            </div>

            <div className="space-y-4">
              {/* Email */}
              <div className="space-y-1">
                <label
                  htmlFor="email"
                  className="block text-[11px] font-semibold uppercase tracking-widest"
                  style={{ color: "rgba(27,27,28,0.55)" }}
                >
                  Adresse Email Institutionnelle
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="w-4 h-4"
                      style={{ color: "#7d7481" }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="prenom.nom@banque.cm"
                    className="block w-full pl-10 h-11 rounded-xl outline-none transition-all text-sm"
                    style={{
                      background: "#fafafa",
                      border: "1px solid #cec3d1",
                      color: "#1b1b1c",
                    }}
                    onFocus={(e) =>
                      (e.target.style.borderColor = "var(--siarf-400)")
                    }
                    onBlur={(e) => (e.target.style.borderColor = "#cec3d1")}
                  />
                </div>
              </div>

              {/* Mot de passe */}
              <div className="space-y-1">
                <label
                  htmlFor="password"
                  className="block text-[11px] font-semibold uppercase tracking-widest"
                  style={{ color: "rgba(27,27,28,0.55)" }}
                >
                  Mot de Passe
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="w-4 h-4"
                      style={{ color: "#7d7481" }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="block w-full pl-10 h-11 rounded-xl outline-none transition-all text-sm"
                    style={{
                      background: "#fafafa",
                      border: "1px solid #cec3d1",
                      color: "#1b1b1c",
                    }}
                    onFocus={(e) =>
                      (e.target.style.borderColor = "var(--siarf-400)")
                    }
                    onBlur={(e) => (e.target.style.borderColor = "#cec3d1")}
                  />
                </div>
              </div>

              {/* Code 2FA */}
              <div className="space-y-1">
                <label
                  htmlFor="totp"
                  className="block text-[11px] font-semibold uppercase tracking-widest"
                  style={{ color: "rgba(27,27,28,0.55)" }}
                >
                  Code Authenticateur (2FA)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="w-4 h-4"
                      style={{ color: "#7d7481" }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                      />
                    </svg>
                  </div>
                  <input
                    id="totp"
                    type="text"
                    value={totp}
                    onChange={(e) => setTotp(e.target.value)}
                    placeholder="000 000"
                    maxLength={7}
                    className="block w-full pl-10 h-11 rounded-xl outline-none transition-all font-mono tracking-widest text-sm"
                    style={{
                      background: "#fafafa",
                      border: "1px solid #cec3d1",
                      color: "#1b1b1c",
                    }}
                    onFocus={(e) =>
                      (e.target.style.borderColor = "var(--siarf-400)")
                    }
                    onBlur={(e) => (e.target.style.borderColor = "#cec3d1")}
                  />
                </div>
              </div>

              {/* Bouton */}
              <div className="pt-2">
                <button
                  onClick={handleLogin}
                  disabled={loading}
                  className="w-full h-11 flex justify-center items-center rounded-xl font-semibold text-xs uppercase tracking-[0.2em] transition-all duration-300 disabled:opacity-60"
                  style={{ background: "var(--siarf-700)", color: "white" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "var(--siarf-600)";
                    (e.currentTarget as HTMLButtonElement).style.transform =
                      "translateY(-1px)";
                    (e.currentTarget as HTMLButtonElement).style.boxShadow =
                      "0 0 24px rgba(60,5,97,0.35)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "var(--siarf-700)";
                    (e.currentTarget as HTMLButtonElement).style.transform =
                      "translateY(0)";
                    (e.currentTarget as HTMLButtonElement).style.boxShadow =
                      "none";
                  }}
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                    />
                  </svg>
                  {loading ? "Connexion..." : "Connexion Sécurisée"}
                </button>
              </div>

              <div className="text-center text-xs">
                <span> Problème de connexion ? </span>
                <a
                  href="#"
                  className=" transition-colors hover:underline underline-offset-4"
                  style={{ color: "var(--siarf-500)" }}
                >
                 Contactez le support informatique.
                </a>
              </div>
              <div className="text-center text-xs"> 
                <span>Pas encore de compte ? </span>    

                <a
                  href="/register" 
                  className=" transition-colors hover:underline underline-offset-4"
                  style={{ color: "var(--siarf-500)" }}
                >
                   Créez-en un.
                </a>
              </div>
            </div>

            {/* Footer bas de carte */}
            <div
              className="mt-6 pt-5 flex justify-between items-center opacity-50"
              style={{ borderTop: "1px solid #cec3d1" }}
            >
              <div className="flex gap-6">
                {["Privacité", "Conditions", "Certifications"].map((link) => (
                  <a
                    key={link}
                    href="#"
                    className="text-[10px] font-bold uppercase tracking-widest transition-colors"
                    style={{ color: "#4c4450" }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLAnchorElement).style.color =
                        "var(--siarf-700)")
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLAnchorElement).style.color =
                        "#4c4450")
                    }
                  >
                    {link}
                  </a>
                ))}
              </div>
              <span
                className="text-[10px] font-bold uppercase tracking-widest"
                style={{ color: "#4c4450" }}
              >
                © 2026 SIARF
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
