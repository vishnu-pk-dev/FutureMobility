"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

export default function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (
      window.matchMedia("(pointer: coarse)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const glow = glowRef.current;
    const dot = dotRef.current;
    if (!glow || !dot) return;

    const gw = glow.offsetWidth / 2;
    const dw = dot.offsetWidth / 2;

    const xTo = gsap.quickTo(glow, "x", { duration: 0.9, ease: "power3.out" });
    const yTo = gsap.quickTo(glow, "y", { duration: 0.9, ease: "power3.out" });
    const dxTo = gsap.quickTo(dot, "x", { duration: 0.18, ease: "power2.out" });
    const dyTo = gsap.quickTo(dot, "y", { duration: 0.18, ease: "power2.out" });

    const onMove = (e: MouseEvent) => {
      xTo(e.clientX - gw);
      yTo(e.clientY - gw);
      dxTo(e.clientX - dw);
      dyTo(e.clientY - dw);
    };

    const onOver = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest(
        "a, button, [data-cursor]"
      );
      gsap.to(glow, {
        scale: target ? 2.4 : 1,
        opacity: target ? 0.85 : 0.55,
        duration: 0.4,
      });
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
    };
  }, []);

  return (
    <>
      <div
        ref={glowRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[60] h-[560px] w-[560px] rounded-full opacity-55 will-change-transform"
        style={{
          background:
            "radial-gradient(circle, rgba(0,229,255,0.16) 0%, rgba(0,229,255,0.05) 34%, transparent 68%)",
        }}
      />
      <div
        ref={dotRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[70] h-2 w-2 rounded-full bg-neon shadow-[0_0_10px_rgba(0,229,255,0.9)]"
      />
    </>
  );
}