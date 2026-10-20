"use client"

import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "framer-motion"
import { useRef, type ReactNode } from "react"

/**
 * 3D tilt card: rotates toward the cursor, with a moving spotlight,
 * a glare sheen and a glowing gradient border. Children can use
 * `[transform:translateZ(40px)]` to float above the card surface.
 */
export default function TiltCard({
  children,
  className = "",
  max = 10,
  glow = "rgba(125,255,196,0.22)",
}: {
  children: ReactNode
  className?: string
  max?: number
  glow?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const px = useMotionValue(0.5)
  const py = useMotionValue(0.5)
  const sx = useSpring(px, { stiffness: 160, damping: 18 })
  const sy = useSpring(py, { stiffness: 160, damping: 18 })
  const rotateX = useTransform(sy, [0, 1], [max, -max])
  const rotateY = useTransform(sx, [0, 1], [-max, max])
  const lx = useTransform(px, (v) => `${v * 100}%`)
  const ly = useTransform(py, (v) => `${v * 100}%`)
  const spotlight = useMotionTemplate`radial-gradient(420px circle at ${lx} ${ly}, ${glow}, transparent 45%)`
  const glare = useMotionTemplate`linear-gradient(115deg, transparent 20%, rgba(255,255,255,0.12) ${lx}, transparent 80%)`

  function onMove(e: React.PointerEvent) {
    if (e.pointerType !== "mouse") return
    const r = ref.current!.getBoundingClientRect()
    px.set((e.clientX - r.left) / r.width)
    py.set((e.clientY - r.top) / r.height)
  }
  function onLeave() {
    px.set(0.5)
    py.set(0.5)
  }

  return (
    <div style={{ perspective: 1100 }} className="h-full">
      <motion.div
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className={`group relative h-full rounded-[28px] glass glow-border ${className}`}
      >
        <motion.div aria-hidden style={{ background: spotlight }} className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <motion.div aria-hidden style={{ background: glare }} className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] opacity-0 mix-blend-overlay transition-opacity duration-500 group-hover:opacity-100" />
        {children}
      </motion.div>
    </div>
  )
}
