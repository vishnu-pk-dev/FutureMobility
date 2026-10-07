"use client";

import { useEffect, useRef } from "react";

export default function ScrollProgress() {
  const fill = useRef<HTMLDivElement>(null);
  const head = useRef<HTMLDivElement>(null);
  const num = useRef<HTMLSpanElement>(null);
  const pct = useRef({ v: 0 });

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const target = max <= 0 ? 0 : Math.min(1, Math.max(0, window.scrollY / max));
      const cur = pct.current;
      cur.v += (target - cur.v) * 0.12;
      if (Math.abs(target - cur.v) < 0.0005) cur.v = target;
      const h = (cur.v * 100).toFixed(2);
      if (fill.current) fill.current.style.height = `${h}%`;
      if (head.current) head.current.style.top = `${h}%`;
      if (num.current)
        num.current.textContent = String(Math.round(cur.v * 100)).padStart(3, "0");
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed right-4 top-1/2 z-[70] hidden -translate-y-1/2 flex-col items-center gap-3 md:flex lg:right-6"
    >
      <span className="font-display text-[9px] tracking-[0.42em] text-neon/70">
        SCROLL
      </span>
      <div className="relative h-[46vh] w-px bg-neon/25">
        <div
          ref={fill}
          className="absolute left-0 top-0 w-px bg-neon shadow-[0_0_9px_rgba(31,120,255,0.9)]"
          style={{ height: "0%" }}
        />
        <div
          ref={head}
          className="absolute -left-[3.5px] h-[8px] w-[8px] -translate-y-1/2 rounded-full border border-white bg-neon shadow-[0_0_12px_rgba(31,120,255,1)]"
          style={{ top: "0%" }}
        />
      </div>
      <span className="font-display text-[10px] tracking-[0.28em] text-neon/70">
        <span ref={num}>000</span>
        <span className="text-neon/40">%</span>
      </span>
    </div>
  );
}