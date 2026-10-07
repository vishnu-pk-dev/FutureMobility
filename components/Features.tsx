"use client";

import { useEffect, useRef, useState } from "react";
import type * as React from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import Reveal from "@/components/Reveal";
import FutureCarScene from "@/components/FutureCarScene";
import { getLenis } from "@/components/SmoothScroll";

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
            "radial-gradient(240px circle at var(--mx, 50%) var(--my, 50%), rgba(31,120,255,0.12), transparent 72%)",
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
        <span className="h-1 w-1 rotate-45 bg-neon shadow-[0_0_8px_rgba(31,120,255,0.9)]" />
        <span className="hud-chip text-neon/80">{feature.meta}</span>
      </div>
    </article>
  );
}

export default function Features() {
  const root = useRef<HTMLElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const slides = useRef<Array<HTMLDivElement | null>>([]);
  const stepRef = useRef<HTMLSpanElement>(null);
  const progRef = useRef({ p: 0 });
  const uiCleanup = useRef<() => void>(() => {});
  const [red, setRed] = useState(false);

  useEffect(() => {
    return () => uiCleanup.current();
  }, []);

  useEffect(() => {
    setRed(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const top = Math.floor(el.getBoundingClientRect().top + window.scrollY);
    const cur = window.scrollY;
    const height = el.getBoundingClientRect().height;
    if (cur > top + 4 && cur < top + height - 4) {
      window.scrollTo(0, top);
    }
  }, []);

  useGSAP(
    () => {
      if (red) return;

      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        scrollTrigger: {
          trigger: wrapRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          onUpdate: (self) => {
            progRef.current.p = self.progress;
            const el = stepRef.current;
            if (!el) return;
            const stage = Math.min(6, Math.max(0, Math.round(self.progress * 6)));
            const label = stage === 0 ? "INTRO" : `0${stage} / 06`;
            if (el.textContent !== label) el.textContent = label;
          },
        },
      });
      tl.totalDuration(1);

      const wrap = wrapRef.current;
      if (!wrap) return;
      const sectionH = wrap.scrollHeight;
      const viewH = window.innerHeight;
      const travel = sectionH - viewH;
      let latching = false;
      const latch = () => {
        const scroller = getLenis();
        if (!scroller || latching || red) return;
        const st = tl.scrollTrigger;
        if (!st) return;
        const vec = (ScrollTrigger as unknown as { getVelocity: () => number }).getVelocity();
        if (Math.abs(vec) > 35) return;
        const p = st.progress;
        const nearest = Math.round(p * 6) / 6;
        if (Math.abs(p - nearest) > 0.05) return;
        const top = wrap.offsetTop;
        latching = true;
        scroller.scrollTo(top + nearest * travel, {
          duration: 0.8,
          easing: (t: number) => 1 - Math.pow(1 - t, 3),
          onComplete: () => {
            latching = false;
          },
        });
      };
      const debounceRef = { timer: 0 as number };
      const onScrollEnd = () => {
        window.clearTimeout(debounceRef.timer);
        debounceRef.timer = window.setTimeout(latch, 600);
      };
      window.addEventListener("wheel", onScrollEnd);
      window.addEventListener("touchmove", onScrollEnd);
      uiCleanup.current = () => {
        window.removeEventListener("wheel", onScrollEnd);
        window.removeEventListener("touchmove", onScrollEnd);
        window.clearTimeout(debounceRef.timer);
      };

      tl.fromTo(".fe-head", { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.03 }, 0)
        .fromTo(".fe-tags", { y: 20, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.02 }, 0.02)
        .to(".fe-head, .fe-tags", { autoAlpha: 0, y: -40, duration: 0.03, ease: "power2.in" }, 0.07);

      FEATURES.forEach((_, i) => {
        const slide = slides.current[i];
        if (!slide) return;
        const at = (i + 1) / 6;
        tl.fromTo(
          slide,
          { x: 170, autoAlpha: 0, rotationZ: 1.5 },
          { x: 0, autoAlpha: 1, rotationZ: 0, duration: 0.05, ease: "power3.out" },
          at - 0.05
        );
        if (i < FEATURES.length - 1) {
          tl.to(
            slide,
            { x: -170, autoAlpha: 0, rotationZ: -1.5, duration: 0.05, ease: "power2.in" },
            at + 0.05
          );
        }
      });

      tl.to(".fe-credits", { autoAlpha: 1, duration: 0.06 }, 0.94)
        .to(".fe-exit", { autoAlpha: 0.6, duration: 0.14, ease: "power1.inOut" }, 0.955);
    },
    { scope: root, dependencies: [red] }
  );

  if (red) {
    return (
      <section id="features" className="relative overflow-hidden py-24 md:py-32">
        <div className="pointer-events-none absolute inset-0">
          <div className="grid-flat absolute inset-y-0 right-0 w-1/3 opacity-40" />
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(50% 40% at 80% 20%, rgba(31,120,255,0.07), transparent 70%)",
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

  return (
    <div ref={wrapRef} id="features" className="relative h-[700svh] bg-[#04060d]">
      <section ref={root} className="sticky top-0 h-[100svh] overflow-hidden">
        <FutureCarScene progressRef={progRef} />

        <div className="pointer-events-none absolute inset-0 z-[5] bg-[radial-gradient(90%_70%_at_50%_30%,transparent_50%,rgba(4,6,13,0.4)_100%)]" />

        <div className="pointer-events-none absolute inset-x-0 top-[7vh] z-10 px-6 text-center mix-blend-difference">
          <div className="fe-head">
            <p className="hud-chip mb-3 text-white/80">
              <span className="text-white/50">SECTION</span> 03 — ENGINEERING
            </p>
            <h2 className="font-display text-2xl font-black leading-tight text-white md:text-4xl">
              ENGINEERED FOR <span className="text-white">TOMORROW&apos;S</span> ROADS
            </h2>
          </div>
          <div className="fe-tags mt-4 flex flex-wrap items-center justify-center gap-2">
            {["800V", "L4", "AWD", "SOLID-STATE"].map((tag) => (
              <span
                key={tag}
                className="hud-chip border border-white/30 bg-white/10 px-3 py-1 text-white/90"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="fe-scrim pointer-events-none absolute inset-y-0 right-0 z-[15] w-[46vw] max-w-[36rem] bg-[radial-gradient(130%_70%_at_100%_50%,rgba(5,7,15,0.5),transparent_78%)] backdrop-blur-[3px]" />

        {FEATURES.map((feature, i) => (
          <div key={feature.no} className="pointer-events-none absolute inset-0 z-20">
            <div className="flex h-full items-center justify-end px-6 md:px-[7vw]">
              <div
                ref={(el) => {
                  slides.current[i] = el;
                }}
                className="fe-slide w-full max-w-[26rem] mix-blend-difference"
              >
                <div className="border-l-2 border-white/70 pl-6 md:pl-8">
                  <div className="mb-5 flex items-center gap-4 md:gap-5">
                    <span className="font-display text-6xl font-black leading-none text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.6)] md:text-7xl">
                      {feature.no}
                    </span>
                    <div className="h-12 w-px bg-white/40" />
                    <div className="min-w-0">
                      <h3 className="font-display text-sm font-black tracking-[0.14em] text-white md:text-base">
                        {feature.title}
                      </h3>
                      <div className="mt-2 h-8 w-8 text-white/90">{feature.icon}</div>
                    </div>
                  </div>
                  <p className="font-light leading-relaxed text-white/85 md:text-[15px]">
                    {feature.desc}
                  </p>
                  <div className="mt-6 flex items-center gap-3">
                    <span className="h-1 w-1 rotate-45 bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)]" />
                    <span className="hud-chip text-white/90">{feature.meta}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="pointer-events-none absolute inset-x-0 top-4 z-20 flex justify-end px-6 mix-blend-difference md:px-[7vw]">
          <span className="hud-chip border border-white/30 bg-white/10 text-white/90">
            <span className="text-white/50">STEP</span> <span ref={stepRef}>INTRO</span>
          </span>
        </div>

        <p className="fe-credits pointer-events-none absolute bottom-4 left-5 z-10 font-display text-[9px] tracking-[0.18em] text-white/70 opacity-0 mix-blend-difference">
          CHEVROLET C8 FICTIVE · 3D MODEL · CC-BY
        </p>

        <div className="fe-exit pointer-events-none absolute inset-0 z-30 bg-[#05070f] opacity-0" />
      </section>
    </div>
  );
}