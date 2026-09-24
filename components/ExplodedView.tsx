"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import Reveal from "@/components/Reveal";

const PARTS = [
  { id: "shell", off: { x: 0, y: -26 }, px: 0.08 },
  { id: "glass", off: { x: 6, y: -84 }, px: 0.16 },
  { id: "sensor", off: { x: 130, y: -64 }, px: 0.22 },
  { id: "spoiler", off: { x: -8, y: -56 }, px: 0.28 },
  { id: "diffuser", off: { x: 2, y: 64 }, px: 0.34 },
  { id: "battery", off: { x: 0, y: 74 }, px: 0.4 },
  { id: "wheel-r", off: { x: -175, y: 95 }, px: 0.46 },
  { id: "wheel-f", off: { x: 175, y: 95 }, px: 0.52 },
];

const MANIFEST = [
  { id: "chassis", name: "LIGHTFRAME SPINE", meta: "Carbon-lattice monoplane" },
  { id: "shell", name: "MONO-SHELL", meta: "Monocoque safety cell" },
  { id: "glass", name: "ZERO-G CANOPY", meta: "Electrochromic smart glass" },
  { id: "sensor", name: "NEURAL CORE", meta: "32-sensor autonomy pod" },
  { id: "spoiler", name: "ADAPTIVE SPOILER", meta: "+38% downforce" },
  { id: "diffuser", name: "ACTIVE DIFFUSER", meta: "Ground-effect duct" },
  { id: "battery", name: "SOLID-STATE PACK", meta: "800V · 145 kWh" },
  { id: "wheel-r", name: "CRYO AERO WHEELS", meta: "Forged aero blade" },
  { id: "wheel-f", name: "CRYO AERO WHEELS", meta: "Vector driveshaft" },
];

const STROKE = {
  stroke: "currentColor",
  strokeWidth: 2,
  fill: "none",
} as const;

export default function ExplodedView() {
  const root = useRef<HTMLElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const progRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const wrap = wrapRef.current;
      const pin = pinRef.current;
      if (!wrap || !pin) return;

      const tl = gsap.timeline({
        defaults: { ease: "power2.inOut" },
        scrollTrigger: {
          trigger: wrap,
          start: "top top",
          end: "+=170%",
          scrub: 1,
          pin,
          anticipatePin: 1,
        },
      });

      const chassisRow = document.querySelector(
        '[data-row="chassis"]'
      );
      if (chassisRow) {
        tl.set(chassisRow, { autoAlpha: 1, color: "#00e5ff" }, 0);
      }

      PARTS.forEach((p) => {
        const part = gsap.utils.toArray(`.exp [data-part="${p.id}"]`);
        const chip = document.querySelector(`[data-chip="${p.id}"]`);
        const row = document.querySelector(`[data-row="${p.id}"]`);

        if (part.length) {
          tl.to(part, { x: p.off.x, y: p.off.y, duration: 0.07 }, p.px);
          tl.fromTo(
            part,
            { filter: "brightness(2.6)" },
            { filter: "brightness(1)", duration: 0.05 },
            p.px
          );
        }
        if (chip) tl.to(chip, { autoAlpha: 1, duration: 0.05 }, p.px);
        if (row) {
          tl.fromTo(
            row,
            { autoAlpha: 0.35, color: "#55707f" },
            { autoAlpha: 1, color: "#00e5ff", duration: 0.05 },
            p.px
          );
        }
      });

      const prog = { v: 0 };
      tl.fromTo(
        prog,
        { v: 0 },
        {
          v: 100,
          duration: 1.0,
          ease: "none",
          onUpdate: () => {
            if (progRef.current) {
              progRef.current.textContent = String(Math.round(prog.v)).padStart(
                3,
                "0"
              );
            }
          },
        },
        0
      );
    },
    { scope: root }
  );

  return (
    <section id="exploded" ref={root} className="relative bg-abyss/40">
      <div className="relative mx-auto max-w-[1440px] px-5 pt-24 lg:px-10 lg:pt-32">
        <Reveal>
          <p className="hud-chip mb-4 text-neon">
            <span className="text-dim">SECTION</span> 04 — DECONSTRUCTION
          </p>
          <h2 className="font-display text-3xl font-black leading-tight text-ice md:text-5xl">
            SCROLL TO <span className="text-neon text-glow">TEAR IT DOWN</span>
          </h2>
        </Reveal>
      </div>

      <div ref={wrapRef}>
        <div
          ref={pinRef}
          className="relative flex min-h-screen flex-col justify-center overflow-hidden"
        >
          <div className="grid-flat absolute inset-0 opacity-25" />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(70% 60% at 50% 60%, rgba(0,229,255,0.07), transparent 70%)",
            }}
          />

          <div className="exp relative z-[1] mx-auto grid w-full max-w-[1440px] grid-cols-1 items-center gap-6 px-5 py-10 lg:grid-cols-[1.5fr_0.5fr] lg:gap-10 lg:px-10">
            <div className="clip-corner relative order-1 border border-neon/12 bg-void/60 p-3 md:p-6">
              <svg
                viewBox="0 0 1000 470"
                className="h-auto w-full text-neon"
                role="img"
                aria-label="Exploded technical view of the AXION X"
              >
                <defs>
                  <filter id="exp-glow" x="-40%" y="-40%" width="180%" height="180%">
                    <feDropShadow
                      dx="0"
                      dy="0"
                      stdDeviation="4"
                      floodColor="#00e5ff"
                      floodOpacity="0.55"
                    />
                  </filter>
                </defs>

                {/* camera / scan frame */}
                <g className="exp-frame" stroke="#0f3550" strokeWidth="1">
                  <path d="M 18 24 H 60 M 18 24 V 66" />
                  <path d="M 940 24 H 982 M 982 24 V 66" />
                  <path d="M 18 430 H 60 M 18 430 V 388" />
                  <path d="M 940 430 H 982 M 982 430 V 388" />
                </g>
                <text
                  x="30"
                  y="40"
                  className="hud-chip"
                  fill="#2d6b7d"
                  stroke="none"
                >
                  #EXP-014
                </text>
                <text
                  x="748"
                  y="40"
                  className="hud-chip"
                  fill="#2d6b7d"
                  stroke="none"
                >
                  AXION-X // CUTAWAY
                </text>

                {/* ground */}
                <line
                  x1="40"
                  y1="382"
                  x2="960"
                  y2="382"
                  stroke="#0f3550"
                  strokeWidth="1"
                  strokeDasharray="6 6"
                />

                {/* ---------- PARTS ---------- */}
                <g data-part="chassis" filter="url(#exp-glow)">
                  <path
                    d="M 150 262 L 766 266 M 320 200 L 320 262 M 460 176 L 460 262 M 620 214 L 620 266"
                    {...STROKE}
                    strokeWidth="1.5"
                  />
                  <rect x="310" y="188" width="200" height="10" {...STROKE} strokeWidth="1" />
                  <path
                    d="M 180 262 L 180 292 M 700 266 L 700 296"
                    {...STROKE}
                    strokeWidth="1"
                  />
                </g>

                <g data-part="wheel-r">
                  <circle cx="300" cy="300" r="60" {...STROKE} />
                  <circle cx="300" cy="300" r="42" {...STROKE} strokeOpacity="0.35" />
                  <circle cx="300" cy="300" r="16" {...STROKE} />
                  <path d="M 300 258 v 16 M 300 326 v 16 M 258 300 h 16 M 326 300 h 16" {...STROKE} strokeWidth="1" />
                  <path d="M 300 300 L 342 300 M 300 300 L 258 300 M 300 300 L 300 258 M 300 300 L 300 342" {...STROKE} strokeWidth="1" strokeOpacity="0.5" />
                </g>

                <g data-part="wheel-f">
                  <circle cx="720" cy="300" r="60" {...STROKE} />
                  <circle cx="720" cy="300" r="42" {...STROKE} strokeOpacity="0.35" />
                  <circle cx="720" cy="300" r="16" {...STROKE} />
                  <path d="M 720 258 v 16 M 720 326 v 16 M 678 300 h 16 M 746 300 h 16" {...STROKE} strokeWidth="1" />
                  <path d="M 720 300 L 762 300 M 720 300 L 678 300 M 720 300 L 720 258 M 720 300 L 720 342" {...STROKE} strokeWidth="1" strokeOpacity="0.5" />
                </g>

                <g data-part="battery">
                  <rect
                    x="352"
                    y="316"
                    width="296"
                    height="22"
                    rx="6"
                    {...STROKE}
                    strokeWidth="1.5"
                  />
                  <path
                    d="M 460 322 h 80 M 460 332 h 80 M 352 328 h 108 M 588 322 h 60 M 588 332 h 60"
                    {...STROKE}
                    strokeWidth="1"
                    strokeOpacity="0.6"
                  />
                </g>

                <g data-part="diffuser">
                  <path
                    d="M 96 320 L 186 312 L 186 328 L 100 340 Z"
                    {...STROKE}
                    strokeLinejoin="round"
                  />
                  <path
                    d="M 108 326 l 60 -8 M 106 332 l 60 -8"
                    {...STROKE}
                    strokeWidth="1"
                    strokeOpacity="0.5"
                  />
                </g>

                <g data-part="spoiler">
                  <path
                    d="M 118 228 L 200 206 L 208 218 L 130 240 Z"
                    {...STROKE}
                    strokeLinejoin="round"
                  />
                  <path
                    d="M 138 232 h 46 M 140 222 h -8 M 196 222 l 4 4"
                    {...STROKE}
                    strokeWidth="1"
                    strokeOpacity="0.5"
                  />
                </g>

                <g data-part="shell" filter="url(#exp-glow)">
                  <path
                    d="M 96 312 L 100 296 L 128 266 L 176 240 L 250 224 L 320 178 L 420 152 L 596 152 L 646 210 L 748 252 L 768 274 L 772 296 L 762 306 L 780 306 A 60 60 0 0 0 660 306 L 360 306 A 60 60 0 0 0 240 306 L 110 306 Z"
                    {...STROKE}
                    fill="rgba(0,229,255,0.04)"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M 176 244 L 748 258"
                    {...STROKE}
                    stroke="#7df9ff"
                    strokeWidth="1.5"
                  />
                </g>

                <g data-part="glass" fill="rgba(0,229,255,0.06)">
                  <path
                    d="M 430 158 L 584 158 L 634 206 L 570 218 L 470 216 L 392 206 Z"
                    {...STROKE}
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M 470 216 L 470 160 M 530 216 L 530 160 M 590 202 L 596 162"
                    {...STROKE}
                    strokeWidth="1"
                    strokeOpacity="0.45"
                  />
                </g>

                <g data-part="sensor">
                  <path
                    d="M 724 228 L 786 244 L 776 262 L 712 250 Z"
                    {...STROKE}
                    strokeLinejoin="round"
                  />
                  <path
                    d="M 762 226 L 786 240"
                    {...STROKE}
                    stroke="#7df9ff"
                    strokeWidth="1.5"
                  />
                  <circle cx="742" cy="246" r="7" {...STROKE} strokeWidth="1" />
                </g>

                {/* ---------- CHIPS (labels + leaders) ---------- */}
                <g className="opacity-0" data-chip="spoiler">
                  <path d="M 122 222 L 96 46" stroke="#2d6b7d" strokeWidth="1" strokeDasharray="3 4" />
                  <text x="18" y="42" className="hud-chip" fill="#00e5ff" stroke="none">
                    ADAPTIVE SPOILER
                  </text>
                </g>
                <g className="opacity-0" data-chip="glass">
                  <path d="M 500 160 L 320 46" stroke="#2d6b7d" strokeWidth="1" strokeDasharray="3 4" />
                  <text x="240" y="42" className="hud-chip" fill="#00e5ff" stroke="none">
                    ZERO-G CANOPY
                  </text>
                </g>
                <g className="opacity-0" data-chip="shell">
                  <path d="M 480 196 L 466 68" stroke="#2d6b7d" strokeWidth="1" strokeDasharray="3 4" />
                  <text x="352" y="64" className="hud-chip" fill="#00e5ff" stroke="none">
                    MONO-SHELL
                  </text>
                </g>
                <g className="opacity-0" data-chip="sensor">
                  <path d="M 826 230 L 908 56" stroke="#2d6b7d" strokeWidth="1" strokeDasharray="3 4" />
                  <text x="852" y="44" className="hud-chip" fill="#00e5ff" stroke="none">
                    NEURAL CORE
                  </text>
                </g>
                <g className="opacity-0" data-chip="diffuser">
                  <path d="M 132 392 L 104 444" stroke="#2d6b7d" strokeWidth="1" strokeDasharray="3 4" />
                  <text x="48" y="452" className="hud-chip" fill="#00e5ff" stroke="none">
                    ACTIVE DIFFUSER
                  </text>
                </g>
                <g className="opacity-0" data-chip="battery">
                  <path d="M 500 396 L 470 438" stroke="#2d6b7d" strokeWidth="1" strokeDasharray="3 4" />
                  <text x="330" y="452" className="hud-chip" fill="#00e5ff" stroke="none">
                    SOLID-STATE PACK
                  </text>
                </g>
                <g className="opacity-0" data-chip="wheel-r">
                  <path d="M 116 385 L 52 440" stroke="#2d6b7d" strokeWidth="1" strokeDasharray="3 4" />
                  <text x="20" y="466" className="hud-chip" fill="#00e5ff" stroke="none">
                    CRYO WHEEL · REAR
                  </text>
                </g>
                <g className="opacity-0" data-chip="wheel-f">
                  <path d="M 884 385 L 912 432" stroke="#2d6b7d" strokeWidth="1" strokeDasharray="3 4" />
                  <text x="816" y="452" className="hud-chip" fill="#00e5ff" stroke="none">
                    CRYO WHEEL · FRONT
                  </text>
                </g>
              </svg>

              <div className="flex items-center justify-between border-t border-line px-2 pt-3">
                <span className="hud-chip text-dim">DECONSTRUCTION MODE</span>
                <span className="hud-chip text-neon">
                  PROGRESS{" "}
                  <span ref={progRef} className="text-ice">
                    000
                  </span>
                  %
                </span>
              </div>
            </div>

            <div className="order-2 lg:order-1">
              <ul className="space-y-0.5">
                {MANIFEST.map((item, i) => (
                  <li
                    key={item.id}
                    data-row={item.id}
                    className="flex items-center gap-3 border-l-2 border-line py-1.5 pl-3 transition-colors duration-300 md:py-2 md:pl-4"
                  >
                    <span className="font-display text-xs font-black text-dim">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0">
                      <p className="truncate font-display text-[10px] font-bold tracking-[0.16em] text-[#8fc0cf] md:text-[11px]">
                        {item.name}
                      </p>
                      <p className="truncate font-light text-[10px] text-dim md:text-[11px]">
                        {item.meta}
                      </p>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}