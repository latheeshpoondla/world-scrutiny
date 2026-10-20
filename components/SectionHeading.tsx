import type { ReactNode } from "react"
import Reveal from "@/components/fx/Reveal"
import SplitWords from "@/components/fx/SplitWords"

export default function SectionHeading({
  eyebrow,
  title,
  highlight = [],
  intro,
  action,
  center = false,
}: {
  eyebrow: string
  title: string
  highlight?: string[]
  intro?: string
  action?: ReactNode
  center?: boolean
}) {
  return (
    <div className={`flex flex-col gap-6 ${center ? "items-center text-center" : "md:flex-row md:items-end md:justify-between"}`}>
      <div className={center ? "max-w-3xl" : "max-w-2xl"}>
        <Reveal y={16}>
          <p className="eyebrow">{eyebrow}</p>
        </Reveal>
        <SplitWords text={title} highlight={highlight} className="mt-5 font-display text-4xl font-semibold leading-[1.08] tracking-tight md:text-5xl" />
        {intro && (
          <Reveal delay={0.2} y={16}>
            <p className="mt-5 text-lg leading-relaxed text-muted">{intro}</p>
          </Reveal>
        )}
      </div>
      {action && <Reveal delay={0.3} y={16}>{action}</Reveal>}
    </div>
  )
}
