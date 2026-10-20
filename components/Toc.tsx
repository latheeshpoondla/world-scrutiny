"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import type { Heading } from "@/lib/posts"

/** Sticky table of contents that highlights the section currently being read. */
export default function Toc({ headings }: { headings: Heading[] }) {
  const [active, setActive] = useState(headings[0]?.id)

  useEffect(() => {
    const els = headings.map((h) => document.getElementById(h.id)).filter(Boolean) as HTMLElement[]
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: "-90px 0px -65% 0px" }
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [headings])

  return (
    <nav aria-label="Table of contents" className="glass rounded-3xl p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-mint">On this page</p>
      <ul className="relative mt-4 space-y-1 border-l border-line">
        {headings.map((h) => (
          <li key={h.id} className="relative">
            {active === h.id && <motion.span layoutId="toc-active" className="absolute -left-px top-0 h-full w-0.5 bg-leaf shadow-[0_0_10px_var(--leaf)]" />}
            <a
              href={`#${h.id}`}
              className={`block py-1.5 text-sm leading-snug transition ${h.level === 3 ? "pl-6" : "pl-4"} ${active === h.id ? "text-text" : "text-dim hover:text-muted"}`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
