"use client"

import { useEffect, useRef } from "react"

/** Lightweight 2D canvas of glowing "spores" drifting upward, linking when close. Scatters from the cursor. */
export default function SporeField({ density = 0.00006, link = true, className = "" }: { density?: number; link?: boolean; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current!
    const ctx = canvas.getContext("2d")!
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    let w = 0
    let h = 0
    let raf = 0
    let running = true
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const mouse = { x: -9999, y: -9999 }
    type P = { x: number; y: number; vx: number; vy: number; r: number; hue: number; a: number }
    let ps: P[] = []

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      w = rect.width
      h = rect.height
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const n = Math.min(140, Math.floor(w * h * density))
      ps = Array.from({ length: n }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.15,
        vy: -0.08 - Math.random() * 0.25,
        r: 0.6 + Math.random() * 1.8,
        hue: Math.random() < 0.75 ? 150 : 80,
        a: 0.25 + Math.random() * 0.6,
      }))
    }

    let light = "70%"
    let frame = 0
    const draw = () => {
      if (frame++ % 30 === 0) light = getComputedStyle(canvas).getPropertyValue("--spore-l").trim() || "70%"
      ctx.clearRect(0, 0, w, h)
      for (const p of ps) {
        const dx = p.x - mouse.x
        const dy = p.y - mouse.y
        const d2 = dx * dx + dy * dy
        if (d2 < 14000) {
          const f = (14000 - d2) / 14000
          const d = Math.sqrt(d2 + 1)
          p.x += (dx / d) * f * 1.6
          p.y += (dy / d) * f * 1.6
        }
        p.x += p.vx
        p.y += p.vy
        if (p.y < -10) {
          p.y = h + 10
          p.x = Math.random() * w
        }
        if (p.x < -10) p.x = w + 10
        if (p.x > w + 10) p.x = -10
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${p.hue}, 90%, ${light}, ${p.a})`
        ctx.shadowBlur = 12
        ctx.shadowColor = `hsla(${p.hue}, 90%, 60%, 0.9)`
        ctx.fill()
      }
      ctx.shadowBlur = 0
      if (link) {
        for (let i = 0; i < ps.length; i++) {
          for (let j = i + 1; j < ps.length; j++) {
            const dx = ps[i].x - ps[j].x
            const dy = ps[i].y - ps[j].y
            const d = dx * dx + dy * dy
            if (d < 9000) {
              ctx.strokeStyle = `hsla(150, 70%, ${light}, ${0.14 * (1 - d / 9000)})`
              ctx.lineWidth = 0.6
              ctx.beginPath()
              ctx.moveTo(ps[i].x, ps[i].y)
              ctx.lineTo(ps[j].x, ps[j].y)
              ctx.stroke()
            }
          }
        }
      }
      if (running && !reduce) raf = requestAnimationFrame(draw)
    }

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      mouse.x = e.clientX - r.left
      mouse.y = e.clientY - r.top
    }
    const io = new IntersectionObserver(([e]) => {
      running = e.isIntersecting
      cancelAnimationFrame(raf)
      if (running) draw()
    })

    resize()
    io.observe(canvas)
    window.addEventListener("resize", resize)
    window.addEventListener("pointermove", onMove)
    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      window.removeEventListener("resize", resize)
      window.removeEventListener("pointermove", onMove)
    }
  }, [density, link])

  return <canvas ref={ref} aria-hidden className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} />
}
