"use client";

import { useRef } from "react";
import type * as React from "react";
import Reveal from "@/components/Reveal";

type Feature = {
  icon: React.ReactNode;
  title: string;
  desc: string;
  meta: string;
  no: string;
};

const stroke = {
  stroke: "currentColor",
  strokeWidth: 1.5,
  fill: "none",
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

const FEATURES: Feature[] = [
  {
    no: "01",
    title: "SOLID-STATE 800V",
    desc: "Dual-cell solid-state pack stores 145 kWh with zero thermal runaway. Charged to 80% in eleven minutes.",
    meta: "642 MI RANGE",
    icon: (
      <svg viewBox="0 0 24 24" className="h-8 w-8" {...stroke}>
        <path d="M13 2L5 13h5l-1 9 8-11h-5l1-9z" />
      </svg>
    ),
  },
  {
    no: "02",
    title: "QUAD-MOTOR AWD",
    desc: "Four independent motors deliver vectorized torque in 8 milliseconds — faster than the blink of a fuse.",
    meta: "1,050 HP · 0–60 2.1S",
    icon: (
      <svg viewBox="0 0 24 24" className="h-8 w-8" {...stroke}>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v4m0 12v4M2 12h4m12 0h4M4.9 4.9l2.8 2.8m8.6 8.6 2.8 2.8m0-14.2-2.8 2.8M7.7 16.3l-2.8 2.8" />
      </svg>
    ),
  },
  {
    no: "03",
    title: "NEURAL PILOT",
    desc: "Onboard L4 autonomy reads the environment ninety times per second through 32 redundant sensors.",
    meta: "LEVEL 4 AUTONOMY",
    icon: (
      <svg viewBox="0 0 24 24" className="h-8 w-8" {...stroke}>
        <path d="M12 7a5 5 0 1 1-2 9.9M5 3v4m14-4v4M3 12H7m10 0h4M12 2v3" />
        <path d="M9 17l-4 4" />
      </svg>
    ),
  },
  {
    no: "04",
    title: "ADAPTIVE AERO",
    desc: "Active spoiler and diffuser reconfigure the body in 200ms — 38% more downforce at the flick of a switch.",
    meta: "Cd 0.220 · 260 MPH",
    icon: (
      <svg viewBox="0 0 24 24" className="h-8 w-8" {...stroke}>
        <path d="M3 14l9-9 9 9H3zm6 0v7m6-7v7" />
      </svg>
    ),
  },
  {
    no: "05",
    title: "HOLO COCKPIT",
    desc: "A gesture-driven holographic cluster floats above the yoke. No screen. No clutter. Pure intent.",
    meta: "35\u2033 FIELD OF VIEW",
    icon: (
      <svg viewBox="0 0 24 24" className="h-8 w-8" {...stroke}>
        <path d="M12 3l1.5 6L20 10l-6.5 1L12 17l-1.5-6L4 10l6.5-1L12 3z" />
        <path d="M5 19h14M8 22h8" />
      </svg>
    ),
  },
  {
    no: "06",
    title: "CYBER SAFETY CELL",
    desc: "Crash-safe carbon monocoque wrapped in predictive AI that anticipates impact 400ms before contact.",
    meta: "5-STAR PREDICTIVE",
    icon: (
      <svg viewBox="0 0 24 24" className="h-8 w-8" {...stroke}>
        <path d="M12 3l8 3v6c0 5-3.4 8-8 9-4.6-1-8-4-8-9V6l8-3z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
];

function FeatureCard({ feature }: { feature: Feature }) {
  const ref = useRef<HTMLElement>(null);

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    el.style.setProperty("--my", `${e.clientY - rect.top}px`);
  };

  return (
    <article
      ref={ref}
      onMouseMove={onMove}
      className="clip-corner-sm group relative overflow-hidden border border-neon/12 bg-panel/45 p-7 backdrop-blur-sm transition-colors duration-500 hover:border-neon/45 hover:bg-panel/70"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(240px circle at var(--mx, 50%) var(--my, 50%), rgba(0,229,255,0.12), transparent 72%)",
        }}
      />
      <span className="absolute right-6 top-5 font-display text-sm font-black text-neon/25 transition-colors duration-500 group-hover:text-neon/70">
        {feature.no}
      </span>
      <div className="mb-8 flex h-16 w-16 items-center justify-center border border-neon/20 bg-void/60 text-neon transition-all duration-500 group-hover:box-glow group-hover:text-neon2">
        {feature.icon}
      </div>
      <h3 className="font-display text-base font-black tracking-[0.14em] text-ice">
        {feature.title}
      </h3>
      <p className="mt-3 font-light leading-relaxed text-mist">{feature.desc}</p>
      <div className="mt-7 flex items-center gap-3 border-t border-line pt-4">
        <span className="h-1 w-1 rotate-45 bg-neon shadow-[0_0_8px_rgba(0,229,255,0.9)]" />
        <span className="hud-chip text-neon/80">{feature.meta}</span>
      </div>
    </article>
  );
}

export default function Features() {
  return (
    <section id="features" className="relative overflow-hidden py-24 md:py-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="grid-flat absolute inset-y-0 right-0 w-1/3 opacity-40" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(50% 40% at 80% 20%, rgba(0,229,255,0.07), transparent 70%)",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-[1440px] px-5 lg:px-10">
        <div className="mb-16 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <Reveal>
            <p className="hud-chip mb-4 text-neon">
              <span className="text-dim">SECTION</span> 03 — ENGINEERING
            </p>
            <h2 className="font-display text-3xl font-black leading-tight text-ice md:text-5xl">
              ENGINEERED FOR
              <br />
              <span className="text-neon text-glow">TOMORROW&apos;S</span> ROADS
            </h2>
          </Reveal>
          <Reveal delay={0.15} className="max-w-sm">
            <div className="flex flex-wrap gap-2">
              {["800V", "L4", "AWD", "SOLID-STATE"].map((tag) => (
                <span
                  key={tag}
                  className="hud-chip border border-neon/25 bg-void/50 px-3 py-1.5 text-neon"
                >
                  {tag}
                </span>
              ))}
            </div>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, i) => (
            <Reveal key={feature.no} delay={(i % 3) * 0.1} y={60}>
              <FeatureCard feature={feature} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}