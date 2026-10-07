type CarSilhouetteProps = {
  className?: string;
};

export default function CarSilhouette({ className }: CarSilhouetteProps) {
  return (
    <svg
      viewBox="0 0 1000 430"
      className={className}
      fill="none"
      aria-hidden
    >
      <defs>
        <radialGradient id="sil-ground" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1f78ff" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#1f78ff" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx="500" cy="350" rx="330" ry="16" fill="url(#sil-ground)" />

      <g stroke="#1f78ff" strokeWidth="2.5">
        <path
          d="M 96 312
             L 100 296 L 128 266 L 176 240 L 250 224
             L 320 178 L 420 152 L 596 152 L 646 210
             L 748 252 L 768 274 L 772 296 L 762 306
             L 780 306 A 60 60 0 0 0 660 306
             L 360 306 A 60 60 0 0 0 240 306
             L 110 306 Z"
          fill="rgba(31,120,255,0.035)"
          strokeLinejoin="round"
        />
        <path
          d="M 430 158 L 584 158 L 634 206 L 570 218 L 470 216 L 392 206 Z"
          fill="rgba(31,120,255,0.05)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M 176 244 L 748 258"
          stroke="#9cc9ff"
          strokeWidth="1.5"
          opacity="0.9"
        />
      </g>

      <g stroke="#38acff" strokeWidth="1.5">
        <circle cx="300" cy="300" r="60" />
        <circle cx="300" cy="300" r="60" fill="none" opacity="0.25" />
        <circle cx="720" cy="300" r="60" />
        <circle cx="720" cy="300" r="60" fill="none" opacity="0.25" />
      </g>

      <g stroke="#1f78ff" strokeWidth="1">
        <circle cx="300" cy="300" r="20" opacity="0.6" />
        <circle cx="720" cy="300" r="20" opacity="0.6" />
        <line x1="300" y1="282" x2="300" y2="318" opacity="0.5" />
        <line x1="282" y1="300" x2="318" y2="300" opacity="0.5" />
        <line x1="720" y1="282" x2="720" y2="318" opacity="0.5" />
        <line x1="702" y1="300" x2="738" y2="300" opacity="0.5" />
      </g>

      <g stroke="#1f78ff" strokeWidth="1.5" opacity="0.7">
        <path d="M 636 212 L 622 200 M 636 212 L 636 206" />
      </g>
    </svg>
  );
}