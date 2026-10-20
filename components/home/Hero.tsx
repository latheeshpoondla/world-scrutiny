"use client"

import Link from "next/link"
import { motion, useScroll, useTransform } from "framer-motion"
import { useRef, useState } from "react"
import LazyScene from "@/components/three/LazyScene"
import Aurora from "@/components/fx/Aurora"
import Magnetic from "@/components/fx/Magnetic"
import SplitWords from "@/components/fx/SplitWords"
import VideoModal from "@/components/VideoModal"
import { ArrowRight, Brain, Globe, LeafIcon, Play } from "@/components/Icons"
import { site } from "@/lib/site"

const chips = [
  { label: "Knowledge", Icon: Brain, className: "left-[6%] top-[22%]", delay: 0 },
  { label: "Nature", Icon: LeafIcon, className: "right-[4%] top-[38%]", delay: 1.2 },
  { label: "The World", Icon: Globe, className: "left-[14%] bottom-[18%]", delay: 2.1 },
]

export default function Hero() {
  const ref = useRef<HTMLElement>(null)
  const [video, setVideo] = useState(false)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] })
  const textY = useTransform(scrollYProgress, [0, 1], [0, 180])
  const textOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])
  const globeScale = useTransform(scrollYProgress, [0, 1], [1, 1.25])
  const globeY = useTransform(scrollYProgress, [0, 1], [0, 120])

  const onIntro = () => {
    if (site.introVideoId) setVideo(true)
    else window.open(site.socials.youtube, "_blank", "noopener,noreferrer")
  }

  return (
    <section ref={ref} data-theme="dark" className="relative min-h-[100svh] overflow-hidden bg-bg noise">
      <Aurora />
      {/* radial vignette */}
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_50%,transparent_20%,var(--bg)_75%)]" />

      <div className="relative mx-auto grid min-h-[100svh] max-w-7xl items-center gap-6 px-6 pt-28 md:px-10 lg:grid-cols-[1.05fr_1fr]">
        <motion.div style={{ y: textY, opacity: textOpacity }} className="relative z-10 order-2 pb-20 lg:order-1 lg:pb-0">
          <motion.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, duration: 0.8 }} className="eyebrow">
            {site.tagline}
          </motion.p>

          <SplitWords
            as="h1"
            animateOnMount
            text="Discover the world, one idea at a time."
            highlight={["world", "idea"]}
            delay={0.3}
            className="mt-6 font-display text-5xl font-semibold leading-[1.02] tracking-tight sm:text-6xl xl:text-7xl"
          />

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.9 }}
            className="mt-7 max-w-xl text-lg leading-relaxed text-muted"
          >
            Join me as I explore the wonders of our planet, one adventure at a time. From hidden gems to cultural treasures,
            World Scrutiny brings you closer to the heart of each destination. Let’s embark on this journey together and discover
            the world in all its beauty.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1, duration: 0.9 }} className="mt-10 flex flex-wrap items-center gap-4">
            <Magnetic>
              <button onClick={onIntro} className="btn btn-primary group">
                <span className="relative grid h-7 w-7 place-items-center rounded-full bg-bg/90 text-lime pulse-ring">
                  <Play className="h-3.5 w-3.5 translate-x-[1px]" />
                </span>
                Watch WS Intro
              </button>
            </Magnetic>
            <Magnetic>
              <Link href="/blog" className="btn btn-ghost group">
                Explore the blog <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Magnetic>
          </motion.div>
        </motion.div>

        {/* Globe */}
        <motion.div
          style={{ scale: globeScale, y: globeY }}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative order-1 h-[52vh] min-h-[360px] lg:order-2 lg:h-[88vh]"
        >
          <div aria-hidden className="absolute left-1/2 top-[58%] h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-leaf/20 blur-[90px]" />
          <LazyScene scene="globe" className="absolute inset-0" />
          {chips.map(({ label, Icon, className, delay }) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.4 + delay * 0.2, duration: 0.8 }}
              className={`pointer-events-none absolute hidden sm:block ${className}`}
            >
              <div className="glass flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium text-text shadow-[0_0_30px_-8px_rgba(62,224,143,0.6)]" style={{ animation: `float 7s ease-in-out ${delay}s infinite` }}>
                <Icon className="h-4 w-4 text-leaf" /> {label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* scroll cue */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }} className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-dim md:flex">
        Scroll
        <span className="relative h-10 w-6 rounded-full border border-line-strong">
          <span className="absolute left-1/2 top-2 h-2 w-1 -translate-x-1/2 rounded-full bg-mint [animation:float_1.8s_ease-in-out_infinite]" />
        </span>
      </motion.div>

      <VideoModal open={video} onClose={() => setVideo(false)} videoId={site.introVideoId} />
    </section>
  )
}
