"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export default function NotFound() {
  const router = useRouter();
  const starsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!starsRef.current) return;
    for (let i = 0; i < 80; i++) {
      const s = document.createElement("div");
      const size = Math.random() * 2.5 + 0.5;
      Object.assign(s.style, {
        position: "absolute",
        width: `${size}px`,
        height: `${size}px`,
        background: "white",
        borderRadius: "50%",
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        animation: `twinkle ${1.5 + Math.random() * 3}s ease-in-out ${Math.random() * 3}s infinite alternate`,
        opacity: "0.1",
      });
      starsRef.current.appendChild(s);
    }
  }, []);

  return (
    <>
      <style>{`
  @keyframes twinkle { from { opacity: 0.1; } to { opacity: 0.9; } }
  @keyframes shake {
    0%,100% { transform: translateX(0) rotate(0deg); }
    25% { transform: translateX(-2px) rotate(-0.5deg); }
    75% { transform: translateX(2px) rotate(0.5deg); }
  }
  @keyframes puff {
    0% { transform: scale(0.3) translateY(0); opacity: 0.8; }
    100% { transform: scale(2.5) translateY(30px); opacity: 0; }
  }
  @keyframes flicker {
    from { transform: scaleX(0.9) scaleY(0.95); }
    to { transform: scaleX(1.1) scaleY(1.05); }
  }
  @keyframes glow {
    from { filter: brightness(1); }
    to { filter: brightness(1.2); }
  }
  @keyframes scan {
    from { top: -2px; }
    to { top: 100%; }
  }
  @keyframes pulse-dot {
    0%,100% { opacity:1; transform:scale(1); }
    50% { opacity:0.4; transform:scale(0.6); }
  }
  .rocket-shake { animation: shake 0.15s ease-in-out infinite; }
  .flame-flicker { animation: flicker 0.1s ease-in-out infinite alternate; }
  .puff { border-radius:50%; background:rgba(234,207,252,0.25); animation: puff var(--pd) ease-out infinite; }
  .code-404 {
    font-size: clamp(56px, 10vw, 100px);
    font-weight: 800;
    letter-spacing: -3px;
    line-height: 1;
    color: transparent;
    background: linear-gradient(135deg, #EACFFC 0%, #960DF2 50%, #C9A84C 100%);
    -webkit-background-clip: text;
    background-clip: text;
    animation: glow 3s ease-in-out infinite alternate;
  }
`}</style>

      <div
        className="relative h-screen w-screen flex flex-col items-center justify-center overflow-hidden"
        style={{ background: "#3C0561", fontFamily: "Inter, sans-serif" }}
      >
        {/* Grid bg */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(150,13,242,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(150,13,242,0.06) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Scan line */}
        <div
          className="absolute left-0 right-0 h-px pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(150,13,242,0.3), transparent)",
            animation: "scan 4s linear infinite",
          }}
        />

        {/* Stars */}
        <div
          ref={starsRef}
          className="absolute inset-0 overflow-hidden pointer-events-none"
        />

        {/* Brand */}
        <div className="absolute h-12 w-12 top-5 left-7 flex items-center gap-3">
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
            <div
              className="text-[9px] tracking-wider uppercase font-medium"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              Compliance Div
            </div>
          </div>
        </div>

        {/* Rocket — taille réduite */}
        <div
          className="rocket-shake relative"
          style={{ width: 70, height: 140, marginBottom: "1rem" }}
        >
          <svg
            viewBox="0 0 100 200"
            xmlns="http://www.w3.org/2000/svg"
            style={{ width: "100%", height: "100%" }}
          >
            <defs>
              <linearGradient id="bodyGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#5A0891" />
                <stop offset="50%" stopColor="#C06EF7" />
                <stop offset="100%" stopColor="#5A0891" />
              </linearGradient>
              <linearGradient id="noseGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#780AC2" />
                <stop offset="50%" stopColor="#EACFFC" />
                <stop offset="100%" stopColor="#780AC2" />
              </linearGradient>
              <linearGradient id="flameGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#C9A84C" />
                <stop offset="40%" stopColor="#960DF2" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
              <linearGradient id="flame2Grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#EACFFC" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>
            <path
              d="M50 10 C30 10 22 60 22 100 L78 100 C78 60 70 10 50 10Z"
              fill="url(#bodyGrad)"
            />
            <path
              d="M50 5 C42 5 34 30 30 60 L70 60 C66 30 58 5 50 5Z"
              fill="url(#noseGrad)"
            />
            <path d="M22 100 L10 130 L22 125 Z" fill="#3C0561" />
            <path d="M78 100 L90 130 L78 125 Z" fill="#3C0561" />
            <rect
              x="38"
              y="65"
              width="24"
              height="18"
              rx="9"
              fill="#1a0030"
              opacity="0.8"
            />
            <circle cx="50" cy="74" r="7" fill="#0d0020" opacity="0.9" />
            <circle cx="50" cy="74" r="4" fill="#3C0561" opacity="0.8" />
            <circle cx="50" cy="74" r="2" fill="#960DF2" opacity="0.9" />
            <rect
              x="43"
              y="46"
              width="14"
              height="3"
              rx="1.5"
              fill="rgba(255,255,255,0.15)"
            />
            <rect
              x="43"
              y="52"
              width="14"
              height="3"
              rx="1.5"
              fill="rgba(255,255,255,0.1)"
            />
            <g className="flame-flicker">
              <path
                d="M34 122 C34 140 40 158 50 165 C60 158 66 140 66 122 Z"
                fill="url(#flameGrad)"
                opacity="0.9"
              />
              <path
                d="M40 122 C40 136 45 150 50 155 C55 150 60 136 60 122 Z"
                fill="url(#flame2Grad)"
                opacity="0.8"
              />
              <path
                d="M44 122 C44 132 47 142 50 146 C53 142 56 132 56 122 Z"
                fill="rgba(255,255,255,0.6)"
              />
            </g>
          </svg>

          <div
            className="absolute flex gap-1 items-end"
            style={{ bottom: -8, left: "50%", transform: "translateX(-50%)" }}
          >
            {[
              { w: 14, pd: "1.2s", delay: "0s" },
              { w: 18, pd: "1.5s", delay: "0.3s" },
              { w: 11, pd: "1s", delay: "0.6s" },
              { w: 15, pd: "1.3s", delay: "0.15s" },
              { w: 12, pd: "1.1s", delay: "0.45s" },
            ].map((p, i) => (
              <div
                key={i}
                className="puff"
                style={{
                  width: p.w,
                  height: p.w,
                  ["--pd" as string]: p.pd,
                  animationDelay: p.delay,
                }}
              />
            ))}
          </div>
        </div>

        {/* Badge */}
        <div
          className="flex items-center gap-2 px-3 py-1 rounded-full mb-3 text-[10px] font-bold uppercase tracking-widest"
          style={{
            background: "rgba(150,13,242,0.2)",
            border: "1px solid rgba(150,13,242,0.4)",
            color: "#C06EF7",
          }}
        >
          <div
            style={{
              width: 5,
              height: 5,
              background: "#960DF2",
              borderRadius: "50%",
              animation: "pulse-dot 1.5s ease-in-out infinite",
            }}
          />
          Erreur système — Code 404
        </div>

        <div className="code-404 mb-2">404</div>

        <h1
          className="font-bold text-center mb-2"
          style={{
            fontSize: "clamp(14px, 2vw, 18px)",
            color: "#EACFFC",
            letterSpacing: "0.02em",
          }}
        >
          La mission a dévié de sa trajectoire.
        </h1>

        <p
          className="text-center mb-6 leading-relaxed"
          style={{
            fontSize: 12,
            color: "rgba(234,207,252,0.55)",
            maxWidth: 380,
          }}
        >
          Cette zone de la plateforme SIARF n&apos;existe pas ou a été déplacée.
          <br />
          Retournez au centre de contrôle avant que l&apos;alerte ne
          s&apos;active.
        </p>

        <div className="flex gap-3 flex-wrap justify-center">
          <button
            onClick={() => router.push("/dashboard")}
            className="h-10 px-6 rounded-lg font-bold text-[11px] uppercase tracking-widest text-white transition-all"
            style={{ background: "#960DF2" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "#780AC2";
              (e.currentTarget as HTMLButtonElement).style.transform =
                "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "#960DF2";
              (e.currentTarget as HTMLButtonElement).style.transform = "none";
            }}
          >
            ← Tableau de bord
          </button>
          <button
            onClick={() => router.back()}
            className="h-10 px-6 rounded-lg font-semibold text-[11px] transition-all"
            style={{
              border: "1px solid rgba(234,207,252,0.2)",
              color: "rgba(234,207,252,0.7)",
              background: "transparent",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor =
                "rgba(234,207,252,0.5)";
              (e.currentTarget as HTMLButtonElement).style.color = "#EACFFC";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor =
                "rgba(234,207,252,0.2)";
              (e.currentTarget as HTMLButtonElement).style.color =
                "rgba(234,207,252,0.7)";
            }}
          >
            Revenir en arrière
          </button>
        </div>
      </div>
    </>
  );
}
