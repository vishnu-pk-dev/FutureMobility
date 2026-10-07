"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import Reveal from "@/components/Reveal";

const STATS = [
  { value: 2.1, decimals: 1, suffix: "s", label: "0–60 MPH", meta: "LAUNCH MODE" },
  { value: 1050, decimals: 0, suffix: "", label: "HORSEPOWER", meta: "QUAD MOTOR" },
  { value: 642, decimals: 0, suffix: " mi", label: "RANGE", meta: "SOLID-STATE" },
  { value: 320, decimals: 0, suffix: " kW", label: "FAST CHARGE", meta: "800V" },
  { value: 260, decimals: 0, suffix: " mph", label: "TOP SPEED", meta: "AERO LIMITED" },
];

export default function Stats() {
  const root = useRef<HTMLElement>(null);
  const nums = useRef<Array<HTMLSpanElement | null>>([]);

  useGSAP(
    () => {
      nums.current.forEach((el, i) => {
        if (!el) return;
        const stat = STATS[i];
        const num = { v: 0 };
        gsap.to(num, {
          v: stat.value,
          duration: 1.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            once: true,
          },
          onUpdate: () => {
            const out = num.v.toFixed(stat.decimals);
            el.textContent = out;
          },
        });
      });

      gsap.fromTo(
        ".stat-bar",
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 1.6,
          ease: "power3.out",
          stagger: 0.12,
          scrollTrigger: {
            trigger: root.current,
            start: "top 80%",
            once: true,
          },
        }
      );
    },
    { scope: root }
  );

  return (
    <section
      id="performance"
      ref={root}
      className="relative overflow-hidden py-24 md:py-32"
    >
      <div className="grid-flat absolute inset-0 opacity-30" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 45% at 50% 0%, rgba(31,120,255,0.08), transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-[1440px] px-5 lg:px-10">
        <div className="mb-16 flex flex-col items-end justify-between gap-6 md:flex-row">
          <Reveal>
            <p className="hud-chip mb-4 text-neon">
              <span className="text-dim">SECTION</span> 02 — PERFORMANCE
            </p>
            <h2 className="font-display text-3xl font-black leading-tight text-ice md:text-5xl">
              NUMBERS THAT
              <br />
              <span className="text-neon text-glow">REDEFINE</span> MOTION
            </h2>
          </Reveal>
          <Reveal delay={0.15} className="max-w-sm text-right">
            <p className="font-light leading-relaxed text-mist">
              Every figure below was forged in the wind tunnel and validated on
              the grid. This is not a concept. This is a delivery schedule.
            </p>
          </Reveal>
        </div>

        <div className="grid grid-cols-2 gap-px border border-neon/10 bg-neon/10 md:grid-cols-5">
          {STATS.map((stat, i) => (
            <Reveal
              key={stat.label}
              delay={i * 0.08}
              className="group relative bg-void/90 p-6 transition-colors duration-500 hover:bg-panel/60 md:p-8"
            >
              <span className="hud-chip absolute right-5 top-5 text-dim">
                {stat.meta}
              </span>
              <p className="mt-8 font-display text-4xl font-black text-ice md:text-5xl">
                <span
                  ref={(el) => {
                    nums.current[i] = el;
                  }}
                >
                  0
                </span>
                <span className="text-neon text-glow-soft">{stat.suffix}</span>
              </p>
              <p className="mt-2 font-display text-xs font-bold tracking-[0.24em] text-mist">
                {stat.label}
              </p>
              <div className="mt-6 h-[2px] w-full overflow-hidden bg-line">
                <div className="stat-bar h-full w-full origin-left bg-gradient-to-r from-neon to-neon2 shadow-[0_0_12px_rgba(31,120,255,0.7)]" />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}