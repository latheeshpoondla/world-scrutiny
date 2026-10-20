"use client"

import { motion, useScroll, useSpring } from "framer-motion"

export default function ReadingProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 25 })
  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[70] h-[3px] origin-left bg-gradient-to-r from-lime via-leaf to-cyan shadow-[0_0_12px_rgba(62,224,143,0.9)]"
    />
  )
}
