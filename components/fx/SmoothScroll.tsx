"use client"

import Lenis from "lenis"
import { usePathname } from "next/navigation"
import { useEffect, useRef } from "react"

/** Smooth scrolling via Lenis. Skipped for users who prefer reduced motion. */
export default function SmoothScroll() {
  const lenis = useRef<Lenis | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const l = new Lenis({ duration: 1.15, smoothWheel: true, anchors: { offset: -100 } })
    lenis.current = l
    let raf = requestAnimationFrame(function loop(t) {
      l.raf(t)
      raf = requestAnimationFrame(loop)
    })
    return () => {
      cancelAnimationFrame(raf)
      l.destroy()
      lenis.current = null
    }
  }, [])

  useEffect(() => {
    lenis.current?.scrollTo(0, { immediate: true })
  }, [pathname])

  return null
}
