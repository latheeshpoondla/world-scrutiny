"use client"

import Image from "next/image"
import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"

/** Image that drifts against the scroll direction inside its frame. */
export default function ParallaxImage({ src, alt, className = "", strength = 80, sizes = "100vw" }: { src: string; alt: string; className?: string; strength?: number; sizes?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] })
  const y = useTransform(scrollYProgress, [0, 1], [-strength, strength])
  return (
    <div ref={ref} className={`overflow-hidden ${/(absolute|fixed)/.test(className) ? "" : "relative"} ${className}`}>
      <motion.div style={{ y }} className="absolute -inset-y-[120px] inset-x-0">
        <Image src={src} alt={alt} fill sizes={sizes} className="object-cover" />
      </motion.div>
    </div>
  )
}
