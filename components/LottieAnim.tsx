"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import lottie from "lottie-web";

type Props = {
  src: string;
  fallback?: ReactNode;
  className?: string;
};

export default function LottieAnim({ src, fallback, className }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<unknown>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let ok = true;
    setData(null);
    setFailed(false);
    fetch(src)
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then((j) => {
        if (ok) setData(j);
      })
      .catch(() => {
        if (ok) setFailed(true);
      });
    return () => {
      ok = false;
    };
  }, [src]);

  useEffect(() => {
    if (!data || !box.current) return;
    const inst = lottie.loadAnimation({
      container: box.current,
      renderer: "svg",
      loop: true,
      autoplay: true,
      animationData: data as unknown as object,
    });
    return () => inst.destroy();
  }, [data]);

  if (failed) return fallback ? <>{fallback}</> : null;
  return <div ref={box} className={className} />;
}