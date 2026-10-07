"use client";

import { useEffect, useRef } from "react";
import type * as React from "react";

const R = 288; // main blob radius
const SAT_R = R * 0.5; // orbiting satellite radius (merges via goo)
const ORBIT = R * 0.1; // how far satellites wander from the pointer

export default function BodyScan() {
  const root = useRef<HTMLElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const mainRef = useRef<SVGCircleElement>(null);
  const satsRef = useRef<(SVGCircleElement | null)[]>([null, null, null]);
  const px = useRef(0);
  const py = useRef(0);
  const prog = useRef(0);
  const target = useRef(0);
  const phase = useRef(0);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const t = (phase.current += dt);

      prog.current += (target.current - prog.current) * Math.min(1, dt * 1.4);
      prog.current = Math.min(1, Math.max(0, prog.current));

      const g = gRef.current;
      if (g) g.setAttribute("opacity", prog.current.toFixed(3));

      // The wave geometry stays lively via the continuously-orbiting satellites
      // below. The noise scale is deliberately fixed — morphing it makes the
      // blob's coverage (and so the reveal) pulse, which looks like a fade.
      const cx = px.current;
      const cy = py.current;
      const main = mainRef.current;
      if (main) {
        main.setAttribute("cx", String(cx));
        main.setAttribute("cy", String(cy));
      }
      satsRef.current.forEach((c, i) => {
        if (!c) return;
        const a = t * 3.0 + (i * Math.PI * 2) / 3;
        c.setAttribute("cx", String(cx + Math.cos(a) * ORBIT));
        c.setAttribute("cy", String(cy + Math.sin(a * 1.35) * ORBIT));
      });

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const onMove = (e: React.MouseEvent) => {
    const el = root.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    px.current = e.clientX - r.left;
    py.current = e.clientY - r.top;
    target.current = 1;
  };

  const onLeave = () => {
    target.current = 0;
  };

  return (
    <section
      id="scan"
      ref={root}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="relative overflow-hidden bg-abyss"
    >
      {/* mask shape: a wiggly blob that follows the pointer */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full"
      >
        <defs>
          <filter
            id="blobGo"
            x="-40%"
            y="-40%"
            width="180%"
            height="180%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.009"
              numOctaves={3}
              seed={3}
              result="n"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="n"
              scale={40}
              xChannelSelector="R"
              yChannelSelector="G"
              result="d"
            />
            <feGaussianBlur in="d" stdDeviation={2} result="b" />
            <feColorMatrix
              in="b"
              type="matrix"
              values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 26 -9"
            />
          </filter>
          <mask id="blobMask" maskUnits="userSpaceOnUse" x="0" y="0" width="100%" height="100%">
            <rect width="100%" height="100%" fill="black" />
            <g ref={gRef} filter="url(#blobGo)" opacity={0}>
              <circle ref={mainRef} cx={0} cy={0} r={R} fill="white" />
              <circle ref={(e: SVGCircleElement | null) => { satsRef.current[0] = e; }} r={SAT_R} fill="white" />
              <circle ref={(e: SVGCircleElement | null) => { satsRef.current[1] = e; }} r={SAT_R} fill="white" />
              <circle ref={(e: SVGCircleElement | null) => { satsRef.current[2] = e; }} r={SAT_R} fill="white" />
            </g>
          </mask>
        </defs>
      </svg>

      <img
        src="/media/images/car-1.png"
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />

      {/* skeleton revealed only inside the blob */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "url(/media/images/car-1-skeloton.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          mask: "url(#blobMask)",
          WebkitMask: "url(#blobMask)",
        }}
      />

      <div className="relative z-[1] mx-auto flex min-h-screen w-full max-w-[1440px] flex-col justify-between px-5 py-24 lg:px-10">
        <div>
          <p className="hud-chip mb-4 text-neon">
            <span className="text-dim">SECTION</span> 05 — ANATOMY SCAN
          </p>
          <h2 className="font-display text-3xl font-black leading-tight text-[#fff] md:text-5xl">
            HOVER TO <span className="text-neon text-glow">X-RAY THE BONES</span>
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-[#fff] md:text-base">
            Sweep the pointer across the shell — a wiggling blob opens at the
            cursor, drawing the wireframe skin through the paint.
          </p>
        </div>
        <div className="mt-8 flex items-center gap-3">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-neon" />
          <p className="hud-chip text-neon">SCAN ACTIVE</p>
        </div>
      </div>
    </section>
  );
}
