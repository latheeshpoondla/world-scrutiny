"use client"

import Link from "next/link"
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion"
import { useRef } from "react"
import CircuitLeaf from "@/components/art/CircuitLeaf"

const QUOTE = "Every action is a vote for the type of person you wish to become."

/** A big quote whose words light up one by one as you scroll through it. */
export default function ScrollQuote() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] })
  const words = QUOTE.split(" ")

  return (
    <section ref={ref} className="relative mx-auto max-w-7xl overflow-hidden px-6 py-28 md:px-10 md:py-40">
      <CircuitLeaf className="pointer-events-none absolute -right-24 top-1/2 hidden h-[560px] -translate-y-1/2 opacity-40 md:block" />
      <p className="eyebrow">From the journal</p>
      <blockquote className="relative mt-8 max-w-5xl font-display text-4xl font-semibold leading-[1.15] tracking-tight md:text-6xl">
        {words.map((w, i) => (
          <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]} highlight={["vote", "become."].includes(w)}>
            {w}
          </Word>
        ))}
      </blockquote>
      <p className="mt-8 text-muted">
        James Clear, quoted in{" "}
        <Link href="/blog/summary-of-atomic-habits" className="font-semibold text-lime underline decoration-lime/40 underline-offset-4 hover:decoration-lime">
          Summary of Atomic Habits
        </Link>
      </p>
    </section>
  )
}

function Word({ children, progress, range, highlight }: { children: string; progress: MotionValue<number>; range: [number, number]; highlight: boolean }) {
  const opacity = useTransform(progress, range, [0.12, 1])
  const y = useTransform(progress, range, [10, 0])
  return (
    <motion.span style={{ opacity, y }} className={`mr-[0.25em] inline-block ${highlight ? "text-gradient" : ""}`}>
      {children}
    </motion.span>
  )
}
