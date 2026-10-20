/**
 * Abstract "signal" emblem: counter-rotating dashed orbits with nodes, a breathing core
 * and expanding pulse rings. Pure SVG (SMIL animations), theme-aware via CSS variables.
 */
export default function SignalOrb({ className = "", color = "var(--leaf)", accent = "var(--mint)" }: { className?: string; color?: string; accent?: string }) {
  const rings = [
    { r: 70, dash: "2 10", dur: 30, nodes: 2 },
    { r: 115, dash: "14 8", dur: 46, nodes: 3 },
    { r: 160, dash: "1 6", dur: 60, nodes: 4 },
    { r: 205, dash: "40 14", dur: 80, nodes: 3 },
  ]
  return (
    <svg viewBox="-240 -240 480 480" className={className} aria-hidden>
      <defs>
        <radialGradient id="soCore">
          <stop offset="0" stopColor={accent} stopOpacity="0.9" />
          <stop offset="0.4" stopColor={color} stopOpacity="0.35" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle r="120" fill="url(#soCore)">
        <animate attributeName="r" values="110;132;110" dur="5s" repeatCount="indefinite" />
      </circle>

      {[0, 1, 2].map((i) => (
        <circle key={i} r="40" fill="none" stroke={accent} strokeWidth="1.2">
          <animate attributeName="r" from="30" to="230" dur="4.5s" begin={`${i * 1.5}s`} repeatCount="indefinite" />
          <animate attributeName="opacity" from="0.8" to="0" dur="4.5s" begin={`${i * 1.5}s`} repeatCount="indefinite" />
        </circle>
      ))}

      {rings.map((ring, i) => (
        <g key={i}>
          <animateTransform attributeName="transform" type="rotate" from={`${i % 2 ? 360 : 0} 0 0`} to={`${i % 2 ? 0 : 360} 0 0`} dur={`${ring.dur}s`} repeatCount="indefinite" />
          <circle r={ring.r} fill="none" stroke={color} strokeOpacity={0.6} strokeWidth={1.3} strokeDasharray={ring.dash} />
          {Array.from({ length: ring.nodes }).map((_, k) => {
            const a = (k / ring.nodes) * Math.PI * 2 + i
            const x = Math.cos(a) * ring.r
            const y = Math.sin(a) * ring.r
            return (
              <g key={k}>
                <circle cx={x} cy={y} r={10} fill={accent} fillOpacity={0.18} />
                <circle cx={x} cy={y} r={4} fill={accent} />
              </g>
            )
          })}
        </g>
      ))}
      <circle r="10" fill={accent} />
    </svg>
  )
}
