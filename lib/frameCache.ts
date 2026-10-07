import { HERO_FRAMES, frameSrc } from "@/lib/media";

const cache = new Map<number, HTMLImageElement>();
let started = false;

const CONCURRENCY = 8;

function orderedIndexes(): number[] {
  const idx = Array.from({ length: HERO_FRAMES.count }, (_, i) => i);
  const head = idx.slice(0, 10);
  const tail = idx.slice(10);
  return [...head, ...tail];
}

export function startFrameWarmup(): void {
  if (started || typeof window === "undefined") return;
  started = true;

  const queue = orderedIndexes();
  let cursor = 0;

  const worker = () => {
    while (cursor < queue.length) {
      const i = queue[cursor++];
      const im = new window.Image();
      im.decoding = "async";
      im.fetchPriority = i < 4 ? "high" : "low";
      im.onload = () => {
        cache.set(i, im);
      };
      im.onerror = () => {
        cache.delete(i);
      };
      im.src = frameSrc(i);
      if (i < 10) cache.set(i, im);
    }
  };

  for (let w = 0; w < CONCURRENCY; w++) worker();
}

export function frameLoaded(i: number): boolean {
  const im = cache.get(i);
  return Boolean(im && im.complete && im.naturalWidth > 0);
}

export function cachedFrame(i: number): HTMLImageElement | undefined {
  return cache.get(i);
}

export function warmDecodeNear(i: number, pad = 3): void {
  for (let d = Math.max(0, i - pad); d <= Math.min(HERO_FRAMES.count - 1, i + pad); d++) {
    const im = cache.get(d);
    if (im && im.complete && im.naturalWidth > 0) im.decode().catch(() => {});
  }
}