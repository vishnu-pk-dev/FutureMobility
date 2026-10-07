"use client";

import { useRef } from "react";
import type { ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import CarScene from "@/components/CarScene";
import LottieAnim from "@/components/LottieAnim";

type Kind = "speedo" | "bars" | "ring" | "bolt" | "odo";

type StatDef = {
  kind: Kind;
  value: number;
  decimals: number;
  unit: string;
  label: string;
  meta: string;
  sub: string;
  meter: number;
};

const STATS: StatDef[] = [
  { kind: "speedo", value: 2.1, decimals: 1, unit: "s", label: "0–100 KM/H", meta: "LAUNCH MODE", sub: "Instant torque, zero drama.", meter: 58 },
  { kind: "bars", value: 1050, decimals: 0, unit: "PS", label: "QUAD MOTOR", meta: "HEAVY HYBRID", sub: "Four motors, one purpose.", meter: 88 },
  { kind: "ring", value: 642, decimals: 0, unit: "mi", label: "RANGE", meta: "SOLID-STATE", sub: "Range without the anxiety.", meter: 86 },
  { kind: "bolt", value: 320, decimals: 0, unit: "kW", label: "FAST CHARGE", meta: "800V", sub: "Faster than your checkout.", meter: 80 },
  { kind: "odo", value: 260, decimals: 0, unit: "mph", label: "TOP SPEED", meta: "AERO LIMITED", sub: "Physics called. We answered.", meter: 87 },
];

function SpeedoVis() {
  const ticks = [-80, -55, -30, -5, 20, 45];
  return (
    <svg viewBox="0 0 100 62" className="h-12 w-[4.5rem]" aria-hidden>
      <path d="M 12 54 A 44 44 0 0 1 88 54" fill="none" stroke="rgba(255,255,255,0.13)" strokeWidth="3" />
      <path
        d="M 12 54 A 44 44 0 0 1 88 54"
        fill="none"
        stroke="#38acff"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="90 138"
        strokeDashoffset="-8"
        opacity="0.85"
      />
      {ticks.map((a) => (
        <line
          key={a}
          x1="50"
          y1="54"
          x2="50"
          y2="46"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="1.4"
          transform={`rotate(${a} 50 54)`}
        />
      ))}
      <g className="s-needle" style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }}>
        <line x1="50" y1="54" x2="50" y2="18" stroke="#1f78ff" strokeWidth="2.6" strokeLinecap="round" />
        <circle cx="50" cy="54" r="3.4" fill="#38acff" />
      </g>
    </svg>
  );
}

function BarsVis() {
  const heights = [0.4, 0.65, 0.85, 1, 0.7];
  return (
    <div className="flex h-12 items-end gap-1.5">
      {heights.map((h, i) => (
        <div
          key={i}
          className="b-bar w-2 rounded-sm bg-gradient-to-t from-neon to-[#38acff] shadow-[0_0_10px_rgba(31,120,255,0.6)]"
          style={{ height: `${h * 100}%`, transformOrigin: "bottom" }}
        />
      ))}
    </div>
  );
}

function RingVis() {
  return (
    <svg viewBox="0 0 90 90" className="h-12 w-12" aria-hidden>
      <circle cx="45" cy="45" r="38" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="6" />
      <circle
        className="r-ring"
        cx="45"
        cy="45"
        r="38"
        fill="none"
        stroke="#38acff"
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray="100"
        strokeDashoffset="100"
        transform="rotate(-90 45 45)"
      />
    </svg>
  );
}

function BoltVis() {
  return (
    <div className="flex flex-col items-center gap-2">
      <svg viewBox="0 0 24 34" className="b-bolt h-10 w-6 drop-shadow-[0_0_10px_rgba(56,172,255,0.95)]" fill="#38acff" aria-hidden>
        <path d="M 16 1 L 3 19 h 8 L 8 33 L 22 13 h -8 Z" />
      </svg>
      <div className="h-1 w-8 overflow-hidden rounded-full bg-white/[0.12]">
        <div className="b-fill h-full w-0 rounded-full bg-gradient-to-r from-neon to-[#38acff]" />
      </div>
    </div>
  );
}

function OdoVis({ value }: { value: number }) {
  const digs = String(value).padStart(3, "0").split("");
  return (
    <div className="flex gap-1">
      {digs.map((d, i) => (
        <div key={i} className="relative h-7 w-6 overflow-hidden border border-white/15 bg-white/5 text-center">
          <div className="o-reel absolute inset-x-0 top-0">
            {Array.from({ length: 10 }, (_, n) => (
              <span key={n} className="block h-7 font-display text-lg font-black leading-7 text-white">
                {n}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

const VIS: Record<Kind, (v: number) => ReactNode> = {
  speedo: () => <SpeedoVis />,
  bars: () => <BarsVis />,
  ring: () => <RingVis />,
  bolt: () => <BoltVis />,
  odo: (v) => <OdoVis value={v} />,
};

export default function Stats() {
  const root = useRef<HTMLElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const rows = useRef<Array<HTMLDivElement | null>>([]);
  const progRef = useRef({ p: 0 });

  useGSAP(
    () => {
      const red = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const settle = (i: number) => {
        const row = rows.current[i];
        if (!row) return;
        const st = STATS[i];
        const q = (s: string) => row.querySelector(s) as HTMLElement | null;
        const num = q(".c-num");
        if (num) num.textContent = st.value.toFixed(st.decimals);
        if (st.kind === "speedo") q(".s-needle")?.style.setProperty("transform", "rotate(9deg)");
        else if (st.kind === "bars") {
          row.querySelectorAll(".b-bar").forEach((b) => {
            (b as HTMLElement).style.setProperty("transform", "scaleY(1)");
          });
        } else if (st.kind === "ring") q(".r-ring")?.style.setProperty("stroke-dashoffset", "18");
        else if (st.kind === "bolt") {
          q(".b-bolt")?.style.setProperty("opacity", "1");
          q(".b-fill")?.style.setProperty("width", "80%");
        } else if (st.kind === "odo") {
          const digs = String(st.value).padStart(3, "0").split("");
          row.querySelectorAll(".o-reel").forEach((r, idx) => {
            (r as HTMLElement).style.setProperty("transform", `translateY(${-Number(digs[idx]) * 28}px)`);
          });
        }
        const fill = row.querySelector<HTMLElement>(".m-fill");
        if (fill) fill.style.setProperty("width", `${st.meter}%`);
      };

      const playMicro = (i: number) => {
        const row = rows.current[i];
        if (!row) return;
        const st = STATS[i];
        const q = (s: string) => row.querySelector(s) as HTMLElement | null;

        if (st.kind === "speedo") {
          gsap.fromTo(q(".s-needle"), { rotation: -80 }, { rotation: 9, duration: 1.5, ease: "power3.inOut" });
        } else if (st.kind === "bars") {
          gsap.fromTo(
            row.querySelectorAll(".b-bar"),
            { scaleY: 0 },
            { scaleY: 1, transformOrigin: "bottom", duration: 1.1, stagger: 0.07, ease: "power3.out" }
          );
        } else if (st.kind === "ring") {
          gsap.fromTo(q(".r-ring"), { strokeDashoffset: 100 }, { strokeDashoffset: 18, duration: 1.5, ease: "power2.out" });
        } else if (st.kind === "bolt") {
          gsap.fromTo(q(".b-bolt"), { opacity: 0, scale: 0.4 }, { opacity: [0, 1, 0.15, 1] as unknown as gsap.TweenValue, scale: 1, duration: 0.7, ease: "none" });
          gsap.fromTo(q(".b-fill"), { width: "0%" }, { width: "80%", duration: 1.3, ease: "power3.out", delay: 0.15 });
        } else if (st.kind === "odo") {
          const digs = String(st.value).padStart(3, "0").split("");
          gsap.fromTo(
            row.querySelectorAll(".o-reel"),
            { y: 0 },
            { y: (_i: number) => -Number(digs[_i]) * 28, duration: 1.4, stagger: 0.15, ease: "power4.out" }
          );
        }

        const num = q(".c-num");
        if (num && st.kind !== "odo") {
          const obj = { v: 0 };
          gsap.to(obj, {
            v: st.value,
            duration: 1.7,
            ease: "power3.out",
            delay: 0.2,
            onUpdate: () => {
              num.textContent = obj.v.toFixed(st.decimals);
            },
          });
        }
        const fill = q(".m-fill");
        if (fill) {
          gsap.fromTo(fill, { width: "0%" }, { width: `${st.meter}%`, duration: 1.5, ease: "power3.out", delay: 0.25 });
        }
      };

      if (red) STATS.forEach((_, i) => settle(i));

      const small = window.innerWidth < 768;
      const scale = small ? 0.5 : 1;

      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        scrollTrigger: {
          trigger: wrapRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          onUpdate: (self) => {
            progRef.current.p = self.progress;
          },
        },
      });
      tl.totalDuration(1.2);

      tl.fromTo(".st-word", { y: 46, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.08, duration: 0.07 }, 0)
        .fromTo(".st-sub", { y: 20, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.07 }, 0.03);

      STATS.forEach((_, i) => {
        const row = rows.current[i];
        if (!row) return;
        const s = 0.3 + i * 0.05;
        tl.fromTo(
          row,
          { x: 70 * scale, y: 110 * scale, autoAlpha: 0 },
          { x: 0, y: 0, autoAlpha: 1, duration: 0.13, ease: "power3.out" },
          s
        );
        if (!red) {
          tl.call(
            () => {
              if (row.dataset.played !== "1") {
                row.dataset.played = "1";
                playMicro(i);
              }
            },
            undefined,
            s + 0.04
          );
        }
      });

      tl.to(rows.current, { autoAlpha: 0, y: -60 * scale, duration: 0.07, stagger: 0.02, ease: "power2.in" }, 0.76)
        .to(".st-details", { autoAlpha: 0, duration: 0.05, ease: "power2.in" }, 0.76)
        .to(".st-head, .st-sub", { autoAlpha: 0, y: -40, duration: 0.05, ease: "power2.in" }, 0.68)
        .to(".st-exit", { autoAlpha: 0.9, duration: 0.12, ease: "power2.inOut" }, 0.88);
    },
    { scope: root }
  );

  return (
    <div ref={wrapRef} id="performance" className="relative h-[500svh] bg-[#050a14]">
      <section ref={root} className="sticky top-0 h-[100svh] overflow-hidden [perspective:1600px]">
        <CarScene progressRef={progRef} />

        <div className="pointer-events-none absolute inset-0 z-[5] bg-[radial-gradient(80%_60%_at_50%_30%,transparent_30%,rgba(5,10,20,0.7)_100%)]" />

        <div className="st-head pointer-events-none absolute inset-x-0 top-[8vh] z-10 px-6 text-center">
          <h2 className="font-display text-3xl font-black leading-tight text-white md:text-5xl">
            <span className="st-word block will-change-transform">NUMBERS THAT</span>
            <span className="st-word block text-[#38acff] text-glow will-change-transform">
              REDEFINE MOTION
            </span>
          </h2>
        </div>

        <p className="st-sub pointer-events-none absolute inset-x-0 top-[20vh] z-10 mx-auto max-w-md px-6 text-center font-light leading-relaxed text-white/55">
          Forged in the wind tunnel, validated on the grid.
        </p>

        <div className="st-details pointer-events-none absolute right-[5vw] top-1/2 z-20 flex w-[22rem] max-w-[88vw] -translate-y-1/2 flex-col items-end gap-4 md:right-[7vw] md:w-[26rem] md:gap-5">
          <div className="flex w-[20rem] items-center justify-between md:w-[24rem]">
            <p className="hud-chip text-[9px] text-[#38acff]/80 md:text-[10px]">PERFORMANCE OS</p>
            <p className="hud-chip flex items-center gap-1.5 text-[9px] text-white/45 md:text-[10px]">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-neon shadow-[0_0_6px_rgba(31,120,255,0.9)]" />
              LINKED
            </p>
          </div>
          {STATS.map((def, i) => (
            <div
              key={def.label}
              ref={(el) => {
                rows.current[i] = el;
              }}
              className="dn-row relative w-[20rem] md:w-[24rem]"
            >
              <div className="relative flex items-center gap-4 overflow-hidden rounded-md border border-white/[0.14] bg-[#0b1220]/80 px-4 py-3 shadow-[0_0_26px_rgba(31,120,255,0.14)] backdrop-blur-md">
                <span className="pointer-events-none absolute left-0 top-0 h-2.5 w-2.5 border-l-2 border-t-2 border-[#38acff]" />
                <span className="pointer-events-none absolute right-0 top-0 h-2.5 w-2.5 border-r-2 border-t-2 border-[#38acff]/40" />
                <span className="pointer-events-none absolute bottom-0 left-0 h-2.5 w-2.5 border-b-2 border-l-2 border-[#38acff]/40" />
                <span className="pointer-events-none absolute bottom-0 right-0 h-2.5 w-2.5 border-b-2 border-r-2 border-[#38acff]" />

                <div className="dn-ico relative flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-md border border-[#38acff]/30 bg-[#0a1424] md:h-[4.5rem] md:w-[4.5rem]">
                  <span className="absolute left-1 top-1 z-10 h-1.5 w-1.5 rounded-full bg-neon2 shadow-[0_0_6px_rgba(56,172,255,0.9)]" />
                  <LottieAnim
                    src={`/media/lottie/${def.kind}.json`}
                    fallback={VIS[def.kind](def.value)}
                    className="h-12 w-12"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="hud-chip truncate text-[9px] text-[#cfeaff]/75 md:text-[10px]">{def.meta}</p>
                    <span className="hud-chip shrink-0 rounded-sm border border-[#38acff]/45 px-1.5 py-0.5 text-[8px] text-[#38acff]">
                      LVL {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <p className="text-right font-display text-2xl font-black leading-tight text-white md:text-3xl">
                    <span className="c-num">0</span>
                    <span className="ml-1.5 text-base font-bold text-[#38acff] md:text-lg">{def.unit}</span>
                  </p>
                  <div className="mt-1.5 h-[5px] w-full overflow-hidden rounded-full bg-white/[0.09]">
                    <div
                      className="m-fill h-full w-0 rounded-full bg-gradient-to-r from-neon to-neon2 shadow-[0_0_8px_rgba(56,172,255,0.7)]"
                      style={{ width: `${def.meter}%` }}
                    />
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <p className="font-display text-[8px] tracking-[0.16em] text-white/55 md:text-[9px]">{def.label}</p>
                    <p className="hud-chip text-[8px] text-[#38acff]">{def.meter}%</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="pointer-events-none absolute bottom-4 left-5 z-10 font-display text-[9px] tracking-[0.18em] text-white/35">
          CENTENARIO ROADSTER · SDC PERFORMANCE · CC-BY-4.0
        </p>

        <div className="st-exit pointer-events-none absolute inset-0 z-30 bg-[#05070f] opacity-0" />
      </section>
    </div>
  );
}