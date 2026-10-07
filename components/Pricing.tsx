"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Reveal from "@/components/Reveal";

const TIERS = [
  {
    name: "AXION LITE",
    price: "$59,900",
    lease: "$849 / MO",
    tag: "FIRST LIGHT",
    video: "/media/video/CarReveal-1-cut.mp4",
    specs: ["320 mi range", "480 hp · 4.9s", "Rear-drive", "Level 2 autonomy"],
    cta: "START HERE",
  },
  {
    name: "AXION S",
    price: "$89,900",
    lease: "$1,099 / MO",
    tag: "PURE MOTION",
    video: "/media/video/CarReveal-1-cut.mp4",
    specs: ["460 mi range", "670 hp · 3.4s", "Rear-drive", "Adaptive cruise"],
    cta: "RESERVE",
  },
  {
    name: "AXION X",
    price: "$129,900",
    lease: "$1,699 / MO",
    tag: "THE FLAGSHIP",
    video: "/media/video/CarReveal-1-cut.mp4",
    specs: ["642 mi range", "1,050 hp · 2.1s", "Quad-motor AWD", "Level 4 autonomy"],
    cta: "CLAIM YOURS",
  },
  {
    name: "AXION X AERO",
    price: "$189,900",
    lease: "LIMITED · 500",
    tag: "TRACK DISTANT",
    video: "/media/video/CarReveal-2-cut.mp4",
    specs: ["642 mi range", "1,250 hp · 1.8s", "Active aero suite", "Carbon pack"],
    cta: "APPLY",
  },
  {
    name: "AXION APEX",
    price: "$259,900",
    lease: "INVITATION",
    tag: "THE APEX",
    video: "/media/video/CarReveal-3.mp4",
    specs: ["700 mi range", "1,400 hp · 1.6s", "Tri-motor AWD", "Track telemetry"],
    cta: "REQUEST ACCESS",
  },
];

const N = TIERS.length;
// Base spacing for the nearest neighbor, responsive so it tucks in on mobile.
const UNIT = "clamp(170px, 34vw, 300px)";
// Per-distance (|d|) tuning, indexed 0=center, 1=neighbor, 2=outer.
// Offsets already include the `d` factor, so the multipliers are the
// per-step spacing: 300px to the neighbor, ~270px more to the outer card.
const OFF_MUL = [0, 1, 0.9];
const TY = [-30, 14, 38];
const SC = [1, 0.84, 0.72];
// Cards stay fully opaque; back cards recede under a white wash instead.
const WASH = [0, 0.45, 0.65];

// Signed shortest distance from the active index, wrapped into a ring.
function ringDelta(i: number, index: number, n: number) {
  let d = (i - index + n) % n;
  if (d > Math.floor(n / 2)) d -= n;
  return d;
}

export default function Pricing() {
  const [index, setIndex] = useState(2);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const go = (d: number) => setIndex((i) => (i + d + N) % N);

  // The clip is already trimmed to 2.4s (0.6→3.0 of the original).
  // Play it once from start while active, reset when the card leaves.
  useEffect(() => {
    TIERS.forEach((_, i) => {
      const v = videoRefs.current[i];
      if (!v) return;
      if (i === index) {
        v.currentTime = 0;
        v.play().catch(() => {});
      } else {
        v.pause();
        v.currentTime = 0;
      }
    });
  }, [index]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") { e.preventDefault(); go(1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
  };

  return (
    <section id="pricing" className="relative overflow-hidden py-24 md:py-32">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 30%, rgba(31,120,255,0.08), transparent 70%)",
        }}
      />
      <div className="grid-flat absolute inset-0 opacity-20" />

      <div className="relative mx-auto max-w-[1440px] px-5 lg:px-10">
        <Reveal className="mb-4 text-center">
          <p className="hud-chip mb-4 text-neon">
            <span className="text-dim">SECTION</span> 07 — ACQUISITION
          </p>
          <h2 className="font-display text-3xl font-black leading-tight text-ice md:text-5xl">
            CHOOSE YOUR <span className="text-neon text-glow">WEAPON</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl font-light leading-relaxed text-mist">
            Fully refundable $1,000 reservation. Delivery windows open Q4 2026.
          </p>
        </Reveal>

        <Reveal delay={0.1} y={40}>
          <div
            role="group"
            aria-label="Pricing tiers"
            tabIndex={0}
            onKeyDown={onKeyDown}
            className="relative min-h-[640px] outline-none md:min-h-[620px]"
            style={{ perspective: "1600px" }}
          >
            {TIERS.map((tier, i) => {
              const d = ringDelta(i, index, N);
              const ad = Math.min(Math.abs(d), 2);
              const active = d === 0;
              const tx = `calc(${d} * ${UNIT} * ${OFF_MUL[ad]})`;
              const rot = -d * 16;

              return (
                <article
                  key={tier.name}
                  aria-current={active ? "true" : undefined}
                  className={`clip-corner-sm absolute left-1/2 top-1/2 flex w-[74vw] flex-col border p-8 sm:w-[86vw] md:max-w-[380px] ${
                    active
                      ? "corner-tick border-neon/70 bg-panel/90 box-glow-strong"
                      : "border-neon/15 bg-panel/50"
                  }`}
                  style={{
                    transform: `translate(-50%, -50%) translateX(${tx}) translateY(${TY[ad]}px) scale(${SC[ad]}) rotateY(${rot}deg)`,
                    transformOrigin: "center center",
                    opacity: 1,
                    zIndex: 30 - ad * 8,
                    pointerEvents: active ? "auto" : "none",
                    transition:
                      "transform 620ms cubic-bezier(0.22, 1, 0.36, 1), opacity 450ms ease, box-shadow 420ms ease, border-color 420ms ease, background-color 420ms ease",
                  }}
                >
                  <video
                    ref={(el) => {
                      videoRefs.current[i] = el;
                    }}
                    src={tier.video}
                    muted
                    playsInline
                    preload="auto"
                    loop={false}
                    aria-hidden="true"
                    tabIndex={-1}
                    className="absolute inset-0 z-0 h-full w-full object-cover"
                    style={{ filter: "contrast(1.1) saturate(1.08)" }}
                  />
                  <div className="pointer-events-none absolute inset-0 z-[5] bg-gradient-to-t from-black/50 via-black/15 to-black/35" />

                  {ad > 0 && (
                    <div
                      className="pointer-events-none absolute inset-0 z-30 bg-white"
                      style={{ opacity: WASH[ad] }}
                    />
                  )}

                  {active && (
                    <>
                      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-px bg-gradient-to-r from-transparent via-neon to-transparent" />
                      <div className="pointer-events-none absolute inset-x-0 z-20 h-16 animate-scan bg-gradient-to-b from-transparent via-neon/10 to-transparent" />
                    </>
                  )}

                  <div
                    className="relative z-10 flex flex-1 flex-col"
                    style={{
                      textShadow:
                        "0 2px 10px rgba(0,0,0,0.55), 0 0 3px rgba(0,0,0,0.35)",
                    }}
                  >
                    <span className={`hud-chip mb-6 ${active ? "text-white" : "text-white/60"}`}>
                      {tier.tag}
                    </span>
                    <h3 className="font-display text-xl font-black tracking-[0.16em] text-white">
                      {tier.name}
                    </h3>
                    <p className="mt-6 font-display text-4xl font-black text-white">
                      {tier.price}
                    </p>
                    <p className="hud-chip mt-2 text-white/65">{tier.lease}</p>

                    <ul className="mt-8 flex-1 space-y-3 border-t border-white/25 pt-6">
                      {tier.specs.map((spec) => (
                        <li
                          key={spec}
                          className="flex items-center gap-3 font-light text-white/85"
                        >
                          <span className="h-1 w-1 rotate-45 bg-white/90 shadow-[0_0_6px_rgba(255,255,255,0.6)]" />
                          {spec}
                        </li>
                      ))}
                    </ul>

                    <Link
                      href="#top"
                      tabIndex={active ? 0 : -1}
                      className={`clip-corner-sm mt-9 inline-flex items-center justify-center gap-2 px-6 py-4 font-display text-xs font-bold tracking-[0.22em] transition-all duration-300 [text-shadow:none] ${
                        active
                          ? "bg-black text-white hover:bg-neutral-800 hover:box-glow-strong"
                          : "bg-black/80 text-white/70"
                      }`}
                    >
                      {tier.cta}
                      <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none">
                        <path
                          d="M3 8h10m0 0L9 4m4 4l-4 4"
                          stroke="currentColor"
                          strokeWidth="1.6"
                        />
                      </svg>
                    </Link>
                  </div>
                </article>
              );
            })}

            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous tier"
              className="clip-corner-sm absolute -left-5 top-1/2 z-40 -translate-y-1/2 border border-neon/30 bg-void/85 p-2 text-neon backdrop-blur transition-all duration-300 hover:border-neon hover:box-glow active:scale-90 sm:left-0 sm:p-3"
            >
              <svg className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 16 16" fill="none">
                <path d="M10 2 4 8l6 6" stroke="currentColor" strokeWidth="1.8" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next tier"
              className="clip-corner-sm absolute -right-5 top-1/2 z-40 -translate-y-1/2 border border-neon/30 bg-void/85 p-2 text-neon backdrop-blur transition-all duration-300 hover:border-neon hover:box-glow active:scale-90 sm:right-0 sm:p-3"
            >
              <svg className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 16 16" fill="none">
                <path d="M6 2l6 6-6 6" stroke="currentColor" strokeWidth="1.8" />
              </svg>
            </button>
          </div>
        </Reveal>

        <Reveal delay={0.15} className="-mt-6 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2" role="tablist" aria-label="Select tier">
            {TIERS.map((tier, i) => (
              <button
                key={tier.name}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={tier.name}
                onClick={() => setIndex(i)}
                className={`h-1.5 transition-all duration-500 ${
                  i === index
                    ? "w-12 bg-neon shadow-[0_0_10px_rgba(31,120,255,0.8)]"
                    : "w-6 bg-neon/25 hover:bg-neon/50"
                }`}
              />
            ))}
          </div>
          <p className="hud-chip text-dim">
            <span className="text-neon">SELECTED</span> 0{index + 1} / 0{N} —{" "}
            {TIERS[index].name}
          </p>
        </Reveal>

        <Reveal delay={0.2} className="mt-12 text-center">
          <p className="font-light text-dim">
            Prices exclude destination & tax. Refer a pilot and share up to
            $2,000 in charging credits.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
