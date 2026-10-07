"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { getLenis } from "@/components/SmoothScroll";

const BOOT_LINES = [
  "AXION SYSTEMS v9.4",
  "INITIALIZING PROPULSION CORE",
  "CALIBRATING NEURAL AUTOPILOT",
  "LINKING SOLID-STATE GRID",
  "SYNCHRONIZING AERO SUITE",
  "PILOT ONLINE — STANDBY",
];

export default function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);
  const [gone, setGone] = useState(false);

  useGSAP(
    () => {
      document.documentElement.classList.add("no-scroll");

      const counter = { v: 0 };
      const tl = gsap.timeline({
        onComplete: () => {
          document.documentElement.classList.remove("no-scroll");
          getLenis()?.resize();
          setGone(true);
          window.dispatchEvent(new Event("axion:ready"));
        },
      });

      tl.fromTo(
        ".pl-line",
        { autoAlpha: 0, x: -16 },
        {
          autoAlpha: 1,
          x: 0,
          duration: 0.35,
          ease: "power2.out",
          stagger: 0.13,
        }
      )
        .fromTo(
          ".pl-bar-fill",
          { scaleX: 0 },
          { scaleX: 1, duration: 0.95, ease: "power2.inOut" },
          0.75
        )
        .to(
          counter,
          {
            v: 100,
            duration: 0.95,
            ease: "power1.inOut",
            onUpdate: () => {
              if (numRef.current) {
                numRef.current.textContent = String(Math.round(counter.v)).padStart(
                  3,
                  "0"
                );
              }
            },
          },
          0.75
        )
        .to(".pl-flicker", { autoAlpha: 0.35, duration: 0.15, yoyo: true, repeat: 1 }, 1.4)
        .to(
          root.current,
          { autoAlpha: 0, duration: 0.4, ease: "power2.in" },
          "+=0.1"
        );
    },
    { scope: root }
  );

  if (gone) return null;

  return (
    <div
      ref={root}
      className="pl fixed inset-0 z-[110] flex flex-col items-center justify-center overflow-hidden bg-void no-select"
    >
      <div className="grid-flat absolute inset-0 opacity-40" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 45%, rgba(31,120,255,0.08), transparent 70%)",
        }}
      />
      <div className="relative w-[min(90vw,560px)] px-6">
        <div className="mb-10 flex items-center justify-center gap-3">
          <span className="h-2.5 w-2.5 rounded-full bg-neon shadow-[0_0_12px_rgba(31,120,255,0.9)] animate-pulse" />
          <span className="hud-chip text-neon text-glow pl-flicker">
            AXION MOTION SYSTEMS
          </span>
        </div>

        <div className="mb-8 space-y-2.5 pl-1">
          {BOOT_LINES.map((line) => (
            <p
              key={line}
              className="pl-line hud-chip text-neutral-400 opacity-0 flex items-center gap-3"
            >
              <span className="text-neon/70">▸</span>
              <span>{line}</span>
            </p>
          ))}
        </div>

        <div className="relative h-[3px] w-full overflow-hidden bg-line">
          <div className="pl-bar-fill absolute inset-0 origin-left bg-gradient-to-r from-neon to-neon2 shadow-[0_0_14px_rgba(31,120,255,0.8)]" />
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="hud-chip text-dim">EST. RELEASE · 2026</span>
          <span
            ref={numRef}
            className="font-display text-sm font-bold text-neon text-glow-soft"
          >
            000
          </span>
        </div>
      </div>
    </div>
  );
}