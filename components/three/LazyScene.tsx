"use client"

import dynamic from "next/dynamic"
import { useCallback, useEffect, useRef, useState } from "react"

type SceneProps = { active?: boolean; onReady?: () => void }

const GenesisGlobe = dynamic<SceneProps>(() => import("./GenesisGlobe"), { ssr: false })
const NetworkOrb = dynamic<SceneProps>(() => import("./NetworkOrb"), { ssr: false })

const scenes = { globe: GenesisGlobe, orb: NetworkOrb }

/**
 * Loads a WebGL scene as it approaches the viewport, then fades/scales/un-blurs it in once
 * the scene reports it is ready. The scene stays mounted afterwards and only pauses
 * rendering while off-screen, so it never pops in a second time.
 */
export default function LazyScene({ scene, className = "" }: { scene: keyof typeof scenes; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [ready, setReady] = useState(false)
  const onReady = useCallback(() => setReady(true), [])
  const Scene = scenes[scene]

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => {
        setInView(e.isIntersecting)
        if (e.isIntersecting) setMounted(true)
      },
      { rootMargin: "400px 0px" }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={ref} className={/(absolute|fixed)/.test(className) ? className : `relative ${className}`}>
      <div
        className="absolute inset-0 transition-[opacity,transform,filter] duration-[1800ms] ease-[cubic-bezier(.16,1,.3,1)]"
        style={{ opacity: ready ? 1 : 0, transform: ready ? "none" : "scale(0.9)", filter: ready ? "none" : "blur(14px)" }}
      >
        {mounted && <Scene active={inView} onReady={onReady} />}
      </div>
    </div>
  )
}
