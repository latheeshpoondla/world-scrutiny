"use client"

import { motion } from "framer-motion"
import { useId } from "react"

/**
 * Nature × tech motif: a leaf whose veins are circuit traces. The outline draws itself in,
 * then light pulses run along every trace. Pure SVG, so it is crisp and theme-aware.
 */
export default function CircuitLeaf({ className = "", tone = "green" }: { className?: string; tone?: "green" | "gold" }) {
  const id = useId().replace(/:/g, "")
  const a = tone === "gold" ? "var(--gold)" : "var(--leaf)"
  const b = tone === "gold" ? "#ffe2a3" : "var(--mint)"

  const outline = "M200 470 C 70 380, 30 230, 115 112 C 145 70, 175 42, 200 18 C 225 42, 255 70, 285 112 C 370 230, 330 380, 200 470 Z"
  const ys = [400, 345, 290, 235, 180, 128]
  const halfWidth = (y: number) => 150 * Math.pow(Math.sin((Math.PI * (470 - y)) / 452), 0.9) * 0.82
  const traces = ys.flatMap((y, i) => {
    const w = halfWidth(y)
    const d = 22 + (i % 2) * 8
    const end = Math.max(w * 0.86, 30)
    return [
      { d: `M200 ${y} L${200 - d} ${y - d} L${200 - end} ${y - d}`, x: 200 - end, y: y - d },
      { d: `M200 ${y + 14} L${200 + d} ${y + 14 - d} L${200 + end} ${y + 14 - d}`, x: 200 + end, y: y + 14 - d },
    ]
  })

  return (
    <svg viewBox="0 0 400 500" className={className} aria-hidden>
      <defs>
        <linearGradient id={`g${id}`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor={a} />
          <stop offset="1" stopColor={b} />
        </linearGradient>
        <radialGradient id={`f${id}`} cx="0.5" cy="0.55" r="0.6">
          <stop offset="0" stopColor={a} stopOpacity="0.22" />
          <stop offset="1" stopColor={a} stopOpacity="0" />
        </radialGradient>
        <filter id={`glow${id}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <path d={outline} fill={`url(#f${id})`} />
      <g filter={`url(#glow${id})`} fill="none" stroke={`url(#g${id})`} strokeLinecap="round" strokeLinejoin="round">
        <motion.path d={outline} strokeWidth={2} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2.4, ease: [0.65, 0, 0.35, 1] }} />
        <motion.path d="M200 470 L200 40" strokeWidth={2.2} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.6, delay: 0.4, ease: "easeInOut" }} />
        {traces.map((t, i) => (
          <motion.path key={i} d={t.d} strokeWidth={1.4} strokeOpacity={0.75} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.9, delay: 1 + i * 0.08 }} />
        ))}
      </g>

      {/* pads */}
      {traces.map((t, i) => (
        <motion.circle key={i} cx={t.x} cy={t.y} r={4} fill="var(--bg)" stroke={b} strokeWidth={1.6} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.6 + i * 0.06, type: "spring" }} style={{ transformOrigin: `${t.x}px ${t.y}px` }} />
      ))}

      {/* travelling pulses */}
      <g fill="none" stroke={b} strokeWidth={2.6} strokeLinecap="round" filter={`url(#glow${id})`}>
        <path d="M200 470 L200 40" pathLength={100} strokeDasharray="6 100" style={{ animation: "leaf-pulse 3.2s linear infinite" }} />
        {traces.map((t, i) => (
          <path key={i} d={t.d} pathLength={100} strokeDasharray="14 100" style={{ animation: `leaf-pulse 2.6s linear ${(i * 0.37) % 2.6}s infinite` }} />
        ))}
      </g>
      <style>{`@keyframes leaf-pulse { from { stroke-dashoffset: 114 } to { stroke-dashoffset: 0 } }`}</style>
    </svg>
  )
}
