"use client";

import Link from "next/link";
import Reveal from "@/components/Reveal";

const TIERS = [
  {
    name: "AXION S",
    price: "$89,900",
    lease: "$1,099 / MO",
    tag: "PURE MOTION",
    featured: false,
    specs: ["460 mi range", "670 hp · 3.4s", "Rear-drive", "Adaptive cruise"],
    cta: "RESERVE",
  },
  {
    name: "AXION X",
    price: "$129,900",
    lease: "$1,699 / MO",
    tag: "THE FLAGSHIP",
    featured: true,
    specs: ["642 mi range", "1,050 hp · 2.1s", "Quad-motor AWD", "Level 4 autonomy"],
    cta: "CLAIM YOURS",
  },
  {
    name: "AXION X AERO",
    price: "$189,900",
    lease: "LIMITED · 500",
    tag: "TRACK DISTANT",
    featured: false,
    specs: ["642 mi range", "1,250 hp · 1.8s", "Active aero suite", "Carbon pack"],
    cta: "APPLY",
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="relative overflow-hidden py-24 md:py-32">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 30%, rgba(0,229,255,0.08), transparent 70%)",
        }}
      />
      <div className="grid-flat absolute inset-0 opacity-20" />

      <div className="relative mx-auto max-w-[1440px] px-5 lg:px-10">
        <Reveal className="mb-16 text-center">
          <p className="hud-chip mb-4 text-neon">
            <span className="text-dim">SECTION</span> 06 — ACQUISITION
          </p>
          <h2 className="font-display text-3xl font-black leading-tight text-ice md:text-5xl">
            CHOOSE YOUR <span className="text-neon text-glow">WEAPON</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl font-light leading-relaxed text-mist">
            Fully refundable $1,000 reservation. Delivery windows open Q4 2026.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {TIERS.map((tier, i) => (
            <Reveal key={tier.name} delay={i * 0.12} y={70}>
              <article
                className={`clip-corner-sm relative flex h-full flex-col overflow-hidden border p-8 transition-all duration-500 ${
                  tier.featured
                    ? "border-neon/60 bg-panel/80 box-glow-strong md:-translate-y-4"
                    : "border-neon/12 bg-panel/45 hover:border-neon/35 hover:bg-panel/60"
                }`}
              >
                {tier.featured && (
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-neon to-transparent" />
                )}
                <span className="hud-chip mb-6 text-neon/70">{tier.tag}</span>
                <h3 className="font-display text-xl font-black tracking-[0.16em] text-ice">
                  {tier.name}
                </h3>
                <p className="mt-6 font-display text-4xl font-black text-ice">
                  {tier.price}
                </p>
                <p className="hud-chip mt-2 text-dim">{tier.lease}</p>

                <ul className="mt-8 flex-1 space-y-3 border-t border-line pt-6">
                  {tier.specs.map((spec) => (
                    <li
                      key={spec}
                      className="flex items-center gap-3 font-light text-mist"
                    >
                      <span className="h-1 w-1 rotate-45 bg-neon/80 shadow-[0_0_6px_rgba(0,229,255,0.8)]" />
                      {spec}
                    </li>
                  ))}
                </ul>

                <Link
                  href="#top"
                  className={`clip-corner-sm mt-9 inline-flex items-center justify-center gap-2 px-6 py-4 font-display text-xs font-bold tracking-[0.22em] transition-all duration-300 ${
                    tier.featured
                      ? "bg-neon text-void hover:bg-neon2 hover:box-glow-strong"
                      : "panel text-neon hover:bg-neon/10 hover:box-glow"
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
              </article>
            </Reveal>
          ))}
        </div>

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