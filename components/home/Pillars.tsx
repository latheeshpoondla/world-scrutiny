import Link from "next/link"
import ParallaxImage from "@/components/fx/ParallaxImage"
import Reveal from "@/components/fx/Reveal"
import TiltCard from "@/components/fx/TiltCard"
import SplitWords from "@/components/fx/SplitWords"
import { ArrowRight, Brain, Globe, LeafIcon } from "@/components/Icons"

const pillars = [
  {
    Icon: Brain,
    title: "Knowledge",
    text: "Book summaries and big ideas, distilled into lessons you can carry into everyday life.",
    href: "/blog/summary-of-atomic-habits",
  },
  {
    Icon: LeafIcon,
    title: "Self Improvement",
    text: "Focus, habits and self-control: practical thinking on beating distraction and growing on purpose.",
    href: "/blog/distraction",
  },
  {
    Icon: Globe,
    title: "Exploration",
    text: "The wonders of our planet, its places, cultures and technology, seen through a curious lens.",
    href: "/blog",
  },
]

export default function Pillars() {
  return (
    <section className="relative mx-auto max-w-7xl px-6 py-28 md:px-10 md:py-36">
      <div className="grid items-center gap-14 lg:grid-cols-2">
        <Reveal className="relative">
          <div data-theme="dark" className="glow-border relative rounded-[36px] p-2">
            <ParallaxImage
              src="/WS_Media/Page%20Media/peakpx.jpg"
              alt="Mountain lake surrounded by forest"
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="aspect-[4/5] rounded-[30px] md:aspect-[5/5]"
            />
            <div aria-hidden className="pointer-events-none absolute inset-2 rounded-[30px] bg-gradient-to-tr from-bg/80 via-leaf/10 to-transparent mix-blend-multiply" />
            <div aria-hidden className="pointer-events-none absolute inset-2 rounded-[30px] bg-[linear-gradient(to_top,rgba(2,9,6,0.9),transparent_55%)]" />
            <div className="absolute inset-x-8 bottom-8">
              <p className="font-display text-2xl font-semibold leading-snug md:text-3xl">
                “There is so much
                <br />
                <span className="text-gradient">to know.”</span>
              </p>
            </div>
          </div>
          {/* floating stat chip */}
          <div className="glass absolute -right-3 top-10 hidden rounded-2xl px-5 py-4 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.9)] md:block" style={{ animation: "float 8s ease-in-out infinite" }}>
            <p className="text-xs uppercase tracking-[0.2em] text-dim">Since</p>
            <p className="font-display text-3xl font-semibold text-mint">2024</p>
          </div>
        </Reveal>

        <div>
          <Reveal y={16}>
            <p className="eyebrow">Why World Scrutiny</p>
          </Reveal>
          <SplitWords
            text="A platform for intriguing and valuable insights."
            highlight={["intriguing", "valuable"]}
            className="mt-5 font-display text-4xl font-semibold leading-[1.08] tracking-tight md:text-5xl"
          />
          <Reveal delay={0.2} y={16}>
            <p className="mt-6 text-lg leading-relaxed text-muted">
              World Scrutiny is where I share what I learn on my journey, built on three pillars that guide every post, project and video.
            </p>
          </Reveal>

          <div className="mt-10 grid gap-4">
            {pillars.map(({ Icon, title, text, href }, i) => (
              <Reveal key={title} delay={0.15 * i} y={24}>
                <TiltCard max={5}>
                  <Link href={href} className="flex items-start gap-5 p-6">
                    <span className="relative grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-leaf/25 to-cyan/10 text-mint ring-1 ring-mint/30 [transform:translateZ(30px)]">
                      <Icon className="h-6 w-6" />
                    </span>
                    <span className="flex-1 [transform:translateZ(20px)]">
                      <span className="flex items-center justify-between font-display text-lg font-semibold">
                        {title}
                        <ArrowRight className="h-4 w-4 -translate-x-2 text-lime opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100" />
                      </span>
                      <span className="mt-1 block text-sm leading-relaxed text-muted">{text}</span>
                    </span>
                  </Link>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
