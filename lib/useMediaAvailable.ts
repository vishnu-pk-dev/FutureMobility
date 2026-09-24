"use client";

import { useEffect, useState } from "react";

export function useMediaAvailable(src?: string) {
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (!src) return;
    let cancelled = false;
    fetch(src, { method: "HEAD" })
      .then((r) => {
        if (!cancelled) setOk(r.ok);
      })
      .catch(() => {
        if (!cancelled) setOk(false);
      });
    return () => {
      cancelled = true;
    };
  }, [src]);

  return ok;
}