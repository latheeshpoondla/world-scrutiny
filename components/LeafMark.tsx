/** World Scrutiny logo mark: three faceted leaves, redrawn as SVG from the original logo. */
export default function LeafMark({ className = "", animated = false }: { className?: string; animated?: boolean }) {
  const facet = { stroke: "rgba(2,20,12,0.55)", strokeWidth: 1.4, fill: "none", strokeLinecap: "round" as const }
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <defs>
        <linearGradient id="wsLeafA" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7dffc4" />
          <stop offset="1" stopColor="#16a35b" />
        </linearGradient>
        <linearGradient id="wsLeafB" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c4f56a" />
          <stop offset="1" stopColor="#1fae63" />
        </linearGradient>
        <filter id="wsGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g filter="url(#wsGlow)" className={animated ? "origin-bottom [animation:float_6s_ease-in-out_infinite]" : ""}>
        {/* top leaf */}
        <path d="M32 4c6 5 7.5 12 3.5 20-1 2-2.2 3.4-3.5 4.4-1.3-1-2.5-2.4-3.5-4.4C24.5 16 26 9 32 4Z" fill="url(#wsLeafA)" />
        <path d="M32 7v20M32 13l3 -2M32 19l-3 -2" {...facet} />
        {/* left leaf */}
        <path d="M6 30c10-3 19 0 23 8 1.4 2.8 2 5.6 2 8.6-3 .9-6.2.8-9.4-.4C13 43 8 37.5 6 30Z" fill="url(#wsLeafA)" />
        <path d="M9 31.5 30 45M15 33l1 6M21 36.5l1.6 6" {...facet} />
        {/* right leaf */}
        <path d="M60 22c-13-1-23 4-27 14-1.4 3.6-1.8 7.2-1 10.8 3.6.6 7.4.2 11-1.4C53 41 58.5 33 60 22Z" fill="url(#wsLeafB)" />
        <path d="M57 24.5 33 46M50 27l-1 9M43 31l-.5 9.5M52 31.5l-8 1" {...facet} />
      </g>
    </svg>
  )
}
