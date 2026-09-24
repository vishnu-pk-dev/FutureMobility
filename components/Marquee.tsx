const ROW_ONE = [
  "ALL-ELECTRIC",
  "1,050 HP",
  "LEVEL 4 AUTONOMY",
  "SOLID-STATE",
  "0–60 IN 2.1s",
  "642 MILE RANGE",
  "800V ARCHITECTURE",
];

const ROW_TWO = [
  "AXION SYSTEMS",
  "ZERO EMISSION",
  "NEURAL PILOT",
  "QUAD-MOTOR AWD",
  "AERO-OPTIMIZED",
  "HOLO COCKPIT",
];

function Row({
  items,
  reverse,
  className,
}: {
  items: string[];
  reverse?: boolean;
  className?: string;
}) {
  const seq = [...items, ...items];
  return (
    <div
      className={`mask-fade-r flex overflow-hidden whitespace-nowrap ${className}`}
    >
      <div
        className={`flex shrink-0 items-center ${
          reverse ? "animate-marquee-rev" : "animate-marquee"
        }`}
      >
        {seq.map((item, i) => (
          <div key={i} className="flex items-center">
            <span className="px-8 font-display text-2xl font-black tracking-[0.12em] text-ice/90 md:text-4xl">
              {item}
            </span>
            <svg className="h-5 w-5 shrink-0 text-neon" viewBox="0 0 20 20" fill="none">
              <path d="M10 2v16M2 10h16" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Marquee() {
  return (
    <div className="relative overflow-hidden border-y border-neon/10 bg-abyss/60 py-8">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(80% 120% at 50% 50%, rgba(0,229,255,0.05), transparent 70%)",
        }}
      />
      <div className="relative space-y-4">
        <Row items={ROW_ONE} />
        <Row items={ROW_TWO} reverse />
      </div>
    </div>
  );
}