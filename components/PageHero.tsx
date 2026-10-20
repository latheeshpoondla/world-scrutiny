import type { ReactNode } from "react"
import Aurora from "@/components/fx/Aurora"
import SporeField from "@/components/fx/SporeField"
import SplitWords from "@/components/fx/SplitWords"
import Reveal from "@/components/fx/Reveal"

/** Animated header used at the top of inner pages. */
export default function PageHero({
  eyebrow,
  title,
  highlight = [],
  intro,
  children,
  variant = "green",
  art,
}: {
  eyebrow: string
  title: string
  highlight?: string[]
  intro?: string
  children?: ReactNode
  variant?: "green" | "gold" | "cyan"
  art?: ReactNode
}) {
  return (
    <section className="relative overflow-hidden pb-16 pt-40 md:pb-24 md:pt-48 noise">
      <Aurora variant={variant} className="[mask-image:linear-gradient(to_bottom,#000_60%,transparent)]" />
      <SporeField density={0.00004} />
      {art && (
        <div aria-hidden className="pointer-events-none absolute right-[-4%] top-24 hidden h-[460px] w-[420px] lg:block xl:right-[4%]">
          <div className="h-full w-full [animation:float_9s_ease-in-out_infinite]">{art}</div>
        </div>
      )}
      <div className={`relative mx-auto max-w-7xl px-6 md:px-10 ${art ? "lg:pr-[400px] xl:pr-[440px]" : ""}`}>
        <Reveal y={20}>
          <p className="eyebrow">{eyebrow}</p>
        </Reveal>
        <SplitWords
          as="h1"
          animateOnMount
          text={title}
          highlight={highlight}
          delay={0.1}
          className="mt-6 max-w-4xl font-display text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl"
        />
        {intro && (
          <Reveal delay={0.4} y={20}>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">{intro}</p>
          </Reveal>
        )}
        {children && (
          <Reveal delay={0.55} y={20}>
            <div className="mt-10">{children}</div>
          </Reveal>
        )}
      </div>
    </section>
  )
}
