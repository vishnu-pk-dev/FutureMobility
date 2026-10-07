"use client";

import { useRef, useState } from "react";
import type * as React from "react";
import Image from "next/image";
import { gsap, useGSAP } from "@/lib/gsap";
import { GALLERY_SLOTS } from "@/lib/media";
import { useMediaAvailable } from "@/lib/useMediaAvailable";
import CarSilhouette from "@/components/CarSilhouette";

function ArtFallback({ index, hint }: { index: number; hint: string }) {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-abyss">
      <div className="grid-flat absolute inset-0 opacity-40" />
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(60% 60% at ${60 + index * 6}% ${
            30 + index * 8
          }%, rgba(31,120,255,${0.05 + index * 0.012}), transparent 70%)`,
        }}
      />
      {index === 0 ? (
        <div className="absolute inset-x-0 bottom-6 flex justify-center">
          <CarSilhouette className="h-36 w-auto opacity-45 md:h-48" />
        </div>
      ) : index === 1 ? (
        <div className="pointer-events-none relative h-52 w-52">
          {[0, 1, 2].map((r) => (
            <div
              key={r}
              className="absolute inset-0 rounded-full border border-dashed border-neon/25 [animation:spin_16s_linear_infinite]"
              style={{ inset: `${r * 26}px`, animationDelay: `${r * 2}s` }}
            />
          ))}
          <div className="absolute inset-x-0 top-1/2 h-px bg-neon/25" />
          <div className="absolute inset-y-0 left-1/2 w-px bg-neon/25" />
        </div>
      ) : index === 2 ? (
        <div className="grid-flat absolute inset-0 scale-125 rotate-3 opacity-30" />
      ) : index === 3 ? (
        <div className="relative h-48 w-48">
          {[0, 1, 2, 3].map((r) => (
            <div
              key={r}
              className="absolute rounded-full border border-neon/20"
              style={{ inset: `${r * 30}px` }}
            />
          ))}
          {[0, 45, 90, 135].map((deg) => (
            <div
              key={deg}
              className="absolute left-1/2 top-1/2 h-[110px] w-px origin-top bg-neon/15"
              style={{ transform: `rotate(${deg}deg)` }}
            />
          ))}
        </div>
      ) : (
        <div className="grid-flat absolute inset-0 opacity-50" />
      )}
      <span className="hud-chip absolute bottom-3 right-4 font-mono text-[9px] text-neon/40">
        [{hint}]
      </span>
      <span className="hud-chip absolute left-4 top-4 font-mono text-[10px] text-dim">
        ASSET PENDING
      </span>
    </div>
  );
}

function MediaCard({
  slot,
  index,
}: {
  slot: (typeof GALLERY_SLOTS)[number];
  index: number;
}) {
  const [failed, setFailed] = useState(false);
  const available = useMediaAvailable(slot.file);

  let media: React.ReactNode;
  if (!slot.file || !available || failed) {
    media = <ArtFallback index={index} hint={slot.hint} />;
  } else if (slot.type === "video") {
    media = (
      <video
        className="h-full w-full object-cover"
        src={slot.file}
        muted
        loop
        playsInline
        onError={() => setFailed(true)}
      />
    );
  } else {
    media = (
      <Image
        src={slot.file}
        alt={slot.name}
        fill
        sizes="(max-width: 640px) 68vw, 34vw"
        className="object-cover"
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <figure className="clip-corner relative h-full w-full overflow-hidden border border-neon/12 bg-abyss">
      {media}
      <div className="absolute inset-0 bg-gradient-to-t from-void/85 via-transparent to-void/20" />
      <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between px-5 pb-4">
        <div>
          <p className="hud-chip text-neon/80">{slot.tag}</p>
          <p className="mt-1 font-display text-xl font-black tracking-wide text-ice md:text-2xl">
            {slot.name}
          </p>
        </div>
        <span className="font-display text-sm font-black text-neon/70">
          {index + 1}
        </span>
      </figcaption>
    </figure>
  );
}

export default function Gallery() {
  const root = useRef<HTMLElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const w = wrap.current;
      const t = track.current;
      if (!w || !t) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const getDistance = () => -(t.scrollWidth - window.innerWidth);
      const tween = gsap.to(t, {
        x: getDistance,
        ease: "none",
        scrollTrigger: {
          trigger: w,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });

      gsap.utils.toArray<HTMLElement>(".g-card").forEach((card, i) => {
        gsap.fromTo(
          card,
          { scale: 0.86, opacity: 0.3 },
          {
            scale: 1,
            opacity: 1,
            ease: "none",
            scrollTrigger: {
              containerAnimation: tween,
              trigger: card,
              start: "left 78%",
              end: "left 30%",
              scrub: true,
            },
          }
        );
        if (i % 2 === 0) {
          gsap.fromTo(
            card,
            { yPercent: 5 },
            {
              yPercent: -5,
              ease: "none",
              scrollTrigger: {
                trigger: w,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            }
          );
        }
      });
    },
    { scope: root }
  );

  return (
    <section id="gallery" ref={root} className="relative">
      <div ref={wrap} className="relative h-[330vh]">
        <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
          <div className="mb-8 flex items-end justify-between px-5 lg:px-10">
            <div>
              <p className="hud-chip mb-3 text-neon">
                <span className="text-dim">SECTION</span> 06 — THE GALLERY
              </p>
              <h2 className="font-display text-3xl font-black leading-tight text-ice md:text-5xl">
                KEEP <span className="text-neon text-glow">SCROLLING</span>
              </h2>
            </div>
            <p className="hidden hud-chip text-dim md:block">
              HORIZONTAL SEQUENCE · 0.3× TIDE
            </p>
          </div>

          <div
            ref={track}
            id="g-track"
            className="flex w-max items-center gap-6 pl-5 will-change-transform lg:pl-10"
          >
            {GALLERY_SLOTS.map((slot, i) => (
              <div
                key={slot.hint}
                className="g-card h-[46vh] w-[68vw] shrink-0 sm:w-[46vw] lg:h-[58vh] lg:w-[34vw]"
              >
                <MediaCard slot={slot} index={i} />
              </div>
            ))}
            <div className="flex shrink-0 items-center justify-center pl-6">
              <p className="font-display text-2xl font-black tracking-[0.2em] text-neon/50">
                / END OF SEQUENCE
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}