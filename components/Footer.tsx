"use client";

import { useRef } from "react";
import type * as React from "react";
import Link from "next/link";
import { gsap, useGSAP } from "@/lib/gsap";

const NAV = [
  { href: "#top", label: "Overview" },
  { href: "#performance", label: "Performance" },
  { href: "#features", label: "Features" },
  { href: "#exploded", label: "Deconstructed" },
  { href: "#gallery", label: "Gallery" },
  { href: "#pricing", label: "Pricing" },
];

const SOCIAL = ["X", "INSTAGRAM", "YOUTUBE", "LINKEDIN"];

export default function Footer() {
  const root = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        ".foot-word",
        { yPercent: 120 },
        {
          yPercent: 0,
          duration: 1.2,
          ease: "power4.out",
          stagger: 0.12,
          scrollTrigger: {
            trigger: root.current,
            start: "top 70%",
            once: true,
          },
        }
      );
    },
    { scope: root }
  );

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const input = formRef.current?.querySelector("input");
    if (input) input.value = "";
    alert("Signal locked. We'll transmit launch details soon.");
  };

  return (
    <footer ref={root} className="relative overflow-hidden border-t border-neon/10">
      <div className="grid-flat absolute inset-0 opacity-20" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(80% 70% at 50% 100%, rgba(31,120,255,0.09), transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-[1440px] px-5 py-24 lg:px-10">
        <div className="mb-20 overflow-hidden">
          <p className="hud-chip mb-6 text-neon">
            <span className="text-dim">TRANSMISSION</span> END — FINAL
          </p>
          <h2 className="font-display text-6xl font-black leading-[0.9] tracking-tight text-ice sm:text-7xl md:text-8xl lg:text-9xl">
            {["OWN", "THE", "FUTURE."].map((word) => (
              <span key={word} className="block overflow-hidden">
                <span className="foot-word block text-glow-soft">
                  {word}
                  <span className="text-neon text-glow">.</span>
                </span>
              </span>
            ))}
          </h2>
        </div>

        <div className="grid gap-14 lg:grid-cols-[1.2fr_0.8fr]">
          <form ref={formRef} onSubmit={onSubmit} className="max-w-xl">
            <p className="mb-3 font-display text-sm font-bold tracking-[0.2em] text-ice">
              GET LAUNCH SIGNALS
            </p>
            <p className="mb-6 font-light text-mist">
              Be first into the release queue. No spam, only propulsion updates.
            </p>
            <div className="clip-corner flex border border-neon/25 bg-void/60 p-1.5 focus-within:border-neon/60">
              <input
                type="email"
                required
                placeholder="pilot@future.motion"
                className="w-full bg-transparent px-4 font-light text-ice placeholder:text-dim focus:outline-none"
              />
              <button
                type="submit"
                className="clip-corner-sm shrink-0 bg-neon px-6 py-3 font-display text-xs font-bold tracking-[0.2em] text-void transition-colors hover:bg-neon2"
              >
                TRANSMIT
              </button>
            </div>
          </form>

          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="hud-chip mb-4 text-dim">NAVIGATION</p>
              <ul className="space-y-2.5">
                {NAV.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="font-display text-sm font-semibold tracking-[0.12em] text-mist transition-colors hover:text-neon"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="hud-chip mb-4 text-dim">SIGNAL</p>
              <ul className="space-y-2.5">
                {SOCIAL.map((item) => (
                  <li key={item}>
                    <a
                      href="#top"
                      className="font-display text-sm font-semibold tracking-[0.12em] text-mist transition-colors hover:text-neon"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
              <p className="mt-6 font-light text-sm leading-relaxed text-dim">
                AXION MOTION SYSTEMS
                <br />
                ORBITAL LAB, NIGHTSKY CITY
              </p>
            </div>
          </div>
        </div>

        <div className="mt-20 flex flex-col items-center justify-between gap-4 border-t border-line pt-8 md:flex-row">
          <span className="hud-chip text-dim">
            © 2026 AXION MOTION SYSTEMS · ALL RIGHTS RESERVED
          </span>
          <span className="font-display text-lg font-black tracking-[0.3em] text-ice/70">
            AXION<span className="text-neon">X</span>
          </span>
          <div className="flex items-center gap-4">
            <span className="hud-chip text-dim">SYS v9.4</span>
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-neon shadow-[0_0_8px_rgba(31,120,255,0.9)]" />
          </div>
        </div>
      </div>
    </footer>
  );
}