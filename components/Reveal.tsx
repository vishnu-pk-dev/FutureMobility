"use client";

import { useRef } from "react";
import type * as React from "react";
import { gsap, useGSAP } from "@/lib/gsap";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: keyof React.JSX.IntrinsicElements;
};

export default function Reveal({
  children,
  className,
  delay = 0,
  y = 48,
  as: Tag = "div",
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!ref.current) return;
      gsap.fromTo(
        ref.current,
        { y, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          delay,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ref.current,
            start: "top 88%",
            once: true,
          },
        }
      );
    },
    { scope: ref }
  );

  const TagName = Tag as React.ElementType;
  return (
    <TagName ref={ref} className={className}>
      {children}
    </TagName>
  );
}