"use client"

import { motion, useMotionValue, useSpring } from "framer-motion"
import { useEffect } from "react"

/** A soft light that trails the mouse across the whole site (only shown for fine pointers). */
export default function CursorGlow() {
  const x = useMotionValue(-500)
  const y = useMotionValue(-500)
  const sx = useSpring(x, { stiffness: 120, damping: 20 })
  const sy = useSpring(y, { stiffness: 120, damping: 20 })

  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return
      x.set(e.clientX)
      y.set(e.clientY)
    }
    window.addEventListener("pointermove", move)
    return () => window.removeEventListener("pointermove", move)
  }, [x, y])

  return (
    <motion.div
      aria-hidden
      style={{ x: sx, y: sy }}
      className="pointer-events-none fixed left-0 top-0 z-[60] -ml-[250px] -mt-[250px] hidden h-[500px] w-[500px] rounded-full mix-blend-screen [@media(pointer:fine)]:block"
    >
      <div className="h-full w-full rounded-full bg-[radial-gradient(circle,rgba(62,224,143,0.09),transparent_60%)]" />
    </motion.div>
  )
}
