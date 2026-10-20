"use client"

import { motion } from "framer-motion"

/** Animates a heading word-by-word, each word rising out of a mask. */
export default function SplitWords({
  text,
  className = "",
  delay = 0,
  highlight = [],
  as: Tag = "h2",
  animateOnMount = false,
}: {
  text: string
  className?: string
  delay?: number
  highlight?: string[]
  as?: "h1" | "h2" | "h3"
  animateOnMount?: boolean
}) {
  const words = text.split(" ")
  const trigger = animateOnMount ? { animate: { y: 0, rotate: 0 } } : { whileInView: { y: 0, rotate: 0 }, viewport: { once: true } }
  return (
    <Tag className={className} aria-label={text}>
      {words.map((w, i) => (
        <span key={i} aria-hidden className="-mb-[0.15em] inline-block overflow-hidden pb-[0.15em] align-bottom">
          <motion.span
            className={`inline-block ${highlight.includes(w.replace(/[.,!?]/g, "")) ? "text-gradient animate-shimmer" : ""}`}
            initial={{ y: "110%", rotate: 4 }}
            {...trigger}
            transition={{ duration: 0.9, delay: delay + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
          >
            {w}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </Tag>
  )
}
