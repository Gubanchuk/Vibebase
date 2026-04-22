/**
 * Strong brand logo — a rising-bolt monogram in a hex-rounded frame.
 * The mark reads as a stylized lightning arrow + stair-step growth
 * (прокачка = level up). Size prop controls the whole thing proportionally.
 */
export function Logo({ size = 32 }: { size?: number }) {
  const id = `logo-${size}`;
  return (
    <div
      className="relative shrink-0"
      style={{
        width: size,
        height: size,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
        style={{
          filter: `drop-shadow(0 2px 10px rgba(249,112,102,0.45))`,
        }}
      >
        <defs>
          <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#f97066" />
            <stop offset="55%" stopColor="#fb923c" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
          <linearGradient id={`${id}-bolt`} x1="16" y1="6" x2="24" y2="34" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="100%" stopColor="#ffe8dd" stopOpacity="0.92" />
          </linearGradient>
          <linearGradient id={`${id}-gloss`} x1="0" y1="0" x2="0" y2="20" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Squircle background — not a plain rect; softer corners give it character */}
        <path
          d="M20 2 C 32 2, 38 8, 38 20 C 38 32, 32 38, 20 38 C 8 38, 2 32, 2 20 C 2 8, 8 2, 20 2 Z"
          fill={`url(#${id}-bg)`}
        />

        {/* Gloss highlight on the top half */}
        <path
          d="M20 2 C 32 2, 38 8, 38 20 L 2 20 C 2 8, 8 2, 20 2 Z"
          fill={`url(#${id}-gloss)`}
        />

        {/* The bolt — asymmetric, dynamic, arrow-shaped */}
        <path
          d="M23.5 6.5 L 13 22 L 19.2 22 L 16.5 33.5 L 27 18 L 20.8 18 L 23.5 6.5 Z"
          fill={`url(#${id}-bolt)`}
          stroke="rgba(255,255,255,0.6)"
          strokeWidth="0.4"
          strokeLinejoin="round"
        />

        {/* Tiny spark dot — personality */}
        <circle cx="30" cy="11" r="1.2" fill="#ffffff" opacity="0.85" />
      </svg>
    </div>
  );
}
