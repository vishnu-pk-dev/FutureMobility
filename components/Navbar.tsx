"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { gsap, useGSAP } from "@/lib/gsap";

const LINKS = [
  { href: "#top", label: "Overview" },
  { href: "#performance", label: "Performance" },
  { href: "#features", label: "Features" },
  { href: "#exploded", label: "Deconstructed" },
  { href: "#gallery", label: "Gallery" },
  { href: "#pricing", label: "Pricing" },
];

export default function Navbar() {
  const root = useRef<HTMLElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [overHero, setOverHero] = useState(false);

  useGSAP(
    () => {
      gsap.fromTo(
        ".nav-in",
        { y: -34, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.08,
          delay: 0.1,
        }
      );
    },
    { scope: root }
  );

  useEffect(() => {
    const hero = document.getElementById("top");
    let boundary = window.innerHeight * 3;

    const onScroll = () => {
      const s = window.scrollY > 40;
      setScrolled((prev) => (prev === s ? prev : s));
      const oh = window.scrollY < boundary - window.innerHeight * 0.8;
      setOverHero((prev) => (prev === oh ? prev : oh));
    };

    const measure = () => {
      const w = hero?.parentElement;
      boundary = w ? w.getBoundingClientRect().height : window.innerHeight * 3;
      onScroll();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    measure();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
    };
  }, []);

  const dark = overHero && !open;

  const toggleMenu = (force?: boolean) => {
    const next = force ?? !open;
    setOpen(next);
    if (menu.current) {
      if (next) {
        menu.current.style.pointerEvents = "auto";
        gsap.fromTo(
          ".menu-item",
          { y: 34, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.6, stagger: 0.06, ease: "power3.out" }
        );
      } else {
        gsap.to(menu.current, {
          autoAlpha: 0,
          duration: 0.3,
          onComplete: () => {
            if (menu.current) menu.current.style.pointerEvents = "none";
          },
        });
      }
    }
  };

  return (
    <header
      ref={root}
      className={`fixed inset-x-0 top-0 z-[80] transition-all duration-500 ${
        dark
          ? scrolled
            ? "border-b border-white/10 bg-[#0a1628]/70 backdrop-blur-md"
            : "bg-gradient-to-b from-black/60 to-transparent"
          : scrolled
            ? "border-b border-neon/10 bg-void/80 backdrop-blur-md"
            : ""
      }`}
    >
      <nav className="relative z-20 mx-auto flex max-w-[1440px] items-center justify-between px-5 py-4 lg:px-10">
        <Link href="#top" className="nav-in group flex items-baseline gap-1">
          <span
            className={`font-display text-xl font-black tracking-[0.18em] transition-colors duration-500 ${
              dark ? "text-white" : "text-ice"
            }`}
          >
            AXION
          </span>
          <span
            className={`font-display text-xl font-black transition-colors duration-500 group-hover:animate-flicker ${
              dark ? "text-[#38acff] text-glow" : "text-neon text-glow"
            }`}
          >
            X
          </span>
        </Link>

        <ul className="nav-in hidden items-center gap-8 lg:flex">
          {LINKS.map((link, i) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`hud-chip transition-colors duration-300 ${
                  dark
                    ? "text-white/75 hover:text-[#8fc3ff]"
                    : "text-mist hover:text-neon hover:text-glow-soft"
                }`}
                style={{ transitionDelay: `${i * 20}ms` }}
              >
                <span
                  className={`mr-1 ${dark ? "text-sky-300/70" : "text-neon/60"}`}
                >
                  0{i + 1}
                </span>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="nav-in flex items-center gap-3">
          <Link
            href="#pricing"
            className={`clip-corner-sm hidden px-6 py-2.5 font-display text-xs font-bold tracking-[0.2em] transition-all duration-300 sm:inline-block ${
              dark
                ? "border border-white/25 bg-white/10 text-white backdrop-blur-md hover:bg-white/20"
                : "panel text-neon hover:bg-neon/10 hover:box-glow-strong"
            }`}
          >
            RESERVE
          </Link>

          <button
            onClick={() => toggleMenu()}
            aria-label="Toggle menu"
            className={`flex h-11 w-11 flex-col items-center justify-center gap-1.5 border lg:hidden transition-colors duration-500 ${
              dark ? "border-white/25 bg-white/10" : "border-neon/25 bg-abyss/60"
            }`}
          >
            <span
              className={`h-[2px] w-5 transition-transform duration-300 ${
                open ? "translate-y-[4px] rotate-45" : ""
              } ${dark ? "bg-white" : "bg-neon"}`}
            />
            <span
              className={`h-[2px] w-5 transition-transform duration-300 ${
                open ? "-translate-y-[4px] -rotate-45" : ""
              } ${dark ? "bg-white" : "bg-neon"}`}
            />
          </button>
        </div>
      </nav>

      <div
        ref={menu}
        style={{ pointerEvents: "none" }}
        className="pointer-events-none fixed inset-0 z-10 flex flex-col justify-center bg-void/95 px-8 pt-16 opacity-0 backdrop-blur-xl lg:hidden"
      >
        <ul className="space-y-2">
          {LINKS.map((link, i) => (
            <li key={link.href} className="menu-item opacity-0">
              <Link
                href={link.href}
                onClick={() => toggleMenu(false)}
                className="group flex items-baseline gap-4 py-3"
              >
                <span className="hud-chip text-neon/70">0{i + 1}</span>
                <span className="font-display text-3xl font-black tracking-wide text-ice transition-colors group-hover:text-neon">
                  {link.label}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="menu-item mt-12 hud-chip text-dim opacity-0">
          AXION MOTION SYSTEMS — EST. 2026
        </p>
      </div>
    </header>
  );
}