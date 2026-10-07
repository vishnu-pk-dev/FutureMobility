"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { gsap, useGSAP } from "@/lib/gsap";
import CarSilhouette from "@/components/CarSilhouette";
import { frameSrc, HERO_FRAMES } from "@/lib/media";
import { cachedFrame, startFrameWarmup, warmDecodeNear } from "@/lib/frameCache";

const FRAME_LAST = HERO_FRAMES.count - 1;
const FRAME_CLASS =
  "absolute inset-0 h-full w-full select-none object-cover";

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const layerA = useRef<HTMLImageElement>(null);
  const layerB = useRef<HTMLImageElement>(null);
  const active = useRef(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const im = new Image();
    im.src = frameSrc(0);
    layerA.current!.src = frameSrc(0);
    startFrameWarmup();
  }, []);

  useEffect(() => {
    let done = false;
    const fire = () => {
      if (done) return;
      done = true;
      setReady(true);
    };
    window.addEventListener("axion:ready", fire);
    const t = window.setTimeout(fire, 4200);
    return () => {
      window.removeEventListener("axion:ready", fire);
      window.clearTimeout(t);
    };
  }, []);

  useGSAP(
    () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!root.current) return;

      const finalize = () => {
        gsap.set(".ey", { autoAlpha: 1, y: 0 });
        gsap.set(".wd", { yPercent: 0 });
        gsap.set(".hm", { y: 0, autoAlpha: 1 });
        gsap.set(".hud", { autoAlpha: 1 });
        gsap.set(".he-chips", { autoAlpha: 1, y: 0 });
        gsap.set(".he-sil", { autoAlpha: 0.6, y: 0 });
      };

      if (!ready) {
        if (reduce) finalize();
        return;
      }

      if (reduce) {
        finalize();
        return;
      }

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.set(".he-init, .he-hint, .he-chips", { y: 24, autoAlpha: 0 })
        .set(".wd", { yPercent: 118 })
        .fromTo(
          ".he-grid",
          { autoAlpha: 0.3 },
          { autoAlpha: 1, duration: 1.2 }
        )
        .to(".ey", { y: 0, autoAlpha: 1, duration: 0.7 }, 0.1)
        .to(".wd", { yPercent: 0, duration: 0.85, stagger: 0.1 }, 0.22)
        .fromTo(
          ".he-x",
          { scale: 1.7, autoAlpha: 0 },
          { scale: 1, autoAlpha: 1, duration: 0.7, ease: "power2.out" },
          0.3
        )
        .to(".hm", { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.12 }, 0.72)
        .to(
          ".hud",
          { autoAlpha: 1, duration: 0.6, stagger: 0.08 },
          0.95
        )
        .to(
          ".he-chips",
          { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.1 },
          0.85
        )
        .to(".he-hint", { y: 0, autoAlpha: 1, duration: 0.6 }, 1.15)
        .fromTo(
          ".he-sil",
          { autoAlpha: 0, y: 46 },
          { autoAlpha: 0.6, y: 0, duration: 1.1 },
          0.4
        );
    },
    { scope: root, dependencies: [ready] }
  );

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      if (!wrapRef.current) return;

      const videoProgress = { p: 0 };
      let shown = 0;
      let token = 0;

      const swipe = (i: number) => {
        token += 1;
        const myToken = token;
        const from = active.current ? layerA.current : layerB.current;
        const to = active.current ? layerB.current : layerA.current;
        if (!from || !to) return;

        const flip = () => {
          if (myToken !== token) return;
          from.style.opacity = "0";
          to.style.opacity = "1";
          active.current = !active.current;
          shown = i;
        };

        const apply = () => {
          if (typeof to.decode === "function") {
            to.decode().then(flip).catch(() => {});
          } else {
            flip();
          }
        };

        warmDecodeNear(i);

        const cached = cachedFrame(i);
        if (cached && cached.complete && cached.naturalWidth > 0) {
          to.src = cached.src;
          apply();
          return;
        }
        to.onload = apply;
        to.src = frameSrc(i);
        if (to.complete && to.naturalWidth > 0) apply();
      };

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
        },
      });

      tl.to(".he-con", { yPercent: -18, autoAlpha: 0, ease: "power1.in" }, 0)
        .to(".hud", { autoAlpha: 0, ease: "none" }, 0)
        .to(".he-chips", { autoAlpha: 0, ease: "none" }, 0)
        .to(".he-sil", { yPercent: 30, ease: "none" }, 0)
        .to(".he-grid", { yPercent: 14, ease: "none" }, 0)
        .to(
          videoProgress,
          {
            p: 1,
            duration: 1,
            ease: "none",
            onUpdate: () => {
              const frame = Math.min(
                FRAME_LAST,
                Math.round(videoProgress.p * FRAME_LAST)
              );
              if (frame !== shown) swipe(frame);
            },
          },
          0
        );
    },
    { scope: root }
  );

  return (
    <div ref={wrapRef} className="relative h-[300svh]">
    <section
      id="top"
      ref={root}
      className="sticky top-0 h-[100svh] overflow-hidden bg-void"
    >
      <div className="he-grid absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 80% at 50% 118%, rgba(31,120,255,0.14), transparent 62%), radial-gradient(55% 40% at 50% 0%, rgba(56,172,255,0.09), transparent 70%)",
          }}
        />
        <div className="absolute inset-x-0 bottom-0 h-[44vh] overflow-hidden [perspective:820px]">
          <div className="grid-floor absolute inset-x-[-30%] bottom-[-18%] top-[24%] origin-bottom opacity-80 [transform:rotateX(58deg)]" />
        </div>
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-neon/70 to-transparent opacity-0" />
      </div>

      <div className="absolute inset-0 overflow-hidden bg-void">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={layerA}
          alt=""
          aria-hidden
          decoding="async"
          fetchPriority="high"
          className={`${FRAME_CLASS} opacity-100`}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={layerB}
          alt=""
          aria-hidden
          decoding="async"
          className={`${FRAME_CLASS} opacity-0`}
        />
      </div>

      <div className="he-sil pointer-events-none absolute inset-x-0 bottom-[-2vh] z-[1] flex justify-center">
        <CarSilhouette className="h-[34vh] w-auto opacity-0 md:h-[44vh]" />
      </div>

      <div className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-b from-void/10 via-transparent to-void/35" />
      <div className="scanlines pointer-events-none absolute inset-0 z-[2] opacity-60" />
      <div className="he-scanner shadow-[0_0_24px_rgba(31,120,255,0.5)] absolute left-0 z-[2] h-px w-full animate-scan bg-neon/50" />

      <div className="he-con relative z-[3] mx-auto flex h-full max-w-[1440px] flex-col items-center justify-center px-5 pt-24 text-center lg:px-10">
        <div className="ey he-init flex items-center justify-center gap-3 pb-6 opacity-0">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#38acff] shadow-[0_0_10px_rgba(56,172,255,0.9)]" />
          <span className="hud-chip text-[#9cc9ff] text-glow-soft">
            2026 · ALL-ELECTRIC · 001/∞
          </span>
        </div>

        <h1 className="font-display text-6xl font-black leading-[0.86] tracking-tight text-white sm:text-7xl md:text-8xl xl:text-9xl">
          <span className="block overflow-hidden">
            <span className="wd block will-change-transform">AXION</span>
          </span>
          <span className="flex items-end justify-center gap-4 overflow-hidden md:gap-8">
            <span className="wd block will-change-transform">HYPER</span>
            <span className="he-x block text-[#38acff] text-glow will-change-transform">
              X
            </span>
          </span>
        </h1>
        <p className="hm he-init mt-3 font-display text-sm font-semibold tracking-[0.38em] text-[#8fc3ff] md:text-base">
          THE FUTURE OF ELECTRIC MOTION
        </p>

        <p className="hm he-init mt-6 max-w-xl text-lg font-light leading-relaxed text-white/70 md:text-xl">
          A 1,050 horsepower hyper-GT wrapped in an aerodynamic wedge of
          solid-state energy. Silent launch. Neural autonomy. Zero compromise.
        </p>

        <div className="hm he-init mt-11 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="#pricing"
            className="clip-corner-sm group relative inline-flex items-center gap-3 overflow-hidden bg-neon px-8 py-4 font-display text-xs font-bold tracking-[0.22em] text-void"
          >
            <span className="absolute inset-0 translate-y-full bg-[#38acff] transition-transform duration-300 group-hover:translate-y-0" />
            <span className="relative">RESERVE YOURS</span>
            <svg
              className="relative h-4 w-4"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path
                d="M3 8h10m0 0L9 4m4 4l-4 4"
                stroke="currentColor"
                strokeWidth="1.6"
              />
            </svg>
          </Link>
          <span className="hidden h-9 w-px bg-white/25 sm:block" />
          <Link
            href="#exploded"
            className="clip-corner-sm inline-flex items-center gap-3 border border-white/25 bg-white/[0.07] px-8 py-4 font-display text-xs font-bold tracking-[0.22em] text-white backdrop-blur-md transition-all duration-300 hover:bg-white/15 hover:box-glow"
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#38acff]" />
            EXPLORE PARTS
          </Link>
        </div>
      </div>

      <div className="hud he-init pointer-events-none absolute inset-x-0 bottom-8 z-[3] flex items-end justify-between px-5 font-display text-[10px] tracking-[0.26em] text-white/60 lg:px-10">
        <div className="space-y-1.5">
          <p className="text-[#9cc9ff]/90">
            MODE <span className="text-white">LAUNCH</span>
          </p>
          <p>WHEELS · 4WD</p>
          <p>BATTERY · 98%</p>
        </div>
        <div className="hidden text-right md:block">
          <p className="text-[#9cc9ff]/90">
            VECTOR <span className="text-white">LOCKED</span>
          </p>
          <p>42°07&#8242;N 71°06&#8242;W</p>
          <p>SYS v9.4 · ONLINE</p>
        </div>
      </div>

      <div className="he-chips pointer-events-none absolute left-[5%] top-[23%] z-[3] hidden opacity-0 md:block">
        <div className="flex items-center gap-3 rounded-sm border border-white/15 bg-white/[0.06] px-4 py-2.5 backdrop-blur-sm animate-floaty" style={{ animationDelay: "0.4s" }}>
          <span className="h-1.5 w-1.5 rounded-full bg-[#38acff] shadow-[0_0_10px_rgba(56,172,255,0.95)]" />
          <span className="hud-chip text-neutral-300">
            0–100 <span className="font-bold text-white">2.1s</span>
          </span>
        </div>
      </div>

      <div className="he-chips pointer-events-none absolute right-[5%] top-[27%] z-[3] hidden opacity-0 md:block">
        <div className="flex items-center gap-3 rounded-sm border border-white/15 bg-white/[0.06] px-4 py-2.5 backdrop-blur-sm animate-floaty" style={{ animationDelay: "1s" }}>
          <span className="hud-chip text-neutral-300">
            POWER <span className="font-bold text-white">1050 PS</span>
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-[#38acff] shadow-[0_0_10px_rgba(56,172,255,0.95)]" />
        </div>
      </div>

      <div className="he-chips pointer-events-none absolute bottom-[24%] left-[7%] z-[3] hidden opacity-0 lg:block">
        <div className="flex items-center gap-3 rounded-sm border border-white/15 bg-white/[0.06] px-4 py-2.5 backdrop-blur-sm animate-floaty" style={{ animationDelay: "1.6s" }}>
          <span className="h-1.5 w-1.5 rounded-full bg-[#38acff] shadow-[0_0_10px_rgba(56,172,255,0.95)]" />
          <span className="hud-chip text-neutral-300">
            RANGE <span className="font-bold text-white">820 KM</span>
          </span>
        </div>
      </div>

      <div className="he-chips pointer-events-none absolute bottom-[28%] right-[7%] z-[3] hidden opacity-0 lg:block">
        <div className="flex items-center gap-3 rounded-sm border border-white/15 bg-white/[0.06] px-4 py-2.5 backdrop-blur-sm animate-floaty" style={{ animationDelay: "2.2s" }}>
          <span className="hud-chip text-neutral-300">
            DRIVE <span className="font-bold text-white">AWD</span>
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-[#38acff] shadow-[0_0_10px_rgba(56,172,255,0.95)]" />
        </div>
      </div>

      <div className="he-hint absolute bottom-8 left-1/2 z-[3] flex -translate-x-1/2 flex-col items-center gap-2 opacity-80">
        <span className="font-display text-[10px] tracking-[0.4em] text-white/65">
          SCROLL
        </span>
        <span className="relative h-10 w-px overflow-hidden bg-white/25">
          <span className="absolute inset-x-0 top-0 h-3 animate-scroll-hint bg-[#38acff] shadow-[0_0_8px_rgba(56,172,255,0.9)]" />
        </span>
      </div>
    </section>
    </div>
  );
}