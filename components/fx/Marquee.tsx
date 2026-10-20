import { Fragment } from "react"
import { LeafIcon } from "@/components/Icons"

/** Infinite horizontal ticker of topics. Pauses on hover. */
export default function Marquee({ items, reverse = false }: { items: string[]; reverse?: boolean }) {
  const row = [...items, ...items]
  return (
    <div className="group relative flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
      <div className={`flex w-max shrink-0 items-center gap-10 py-2 pr-10 animate-marquee group-hover:[animation-play-state:paused] ${reverse ? "[animation-direction:reverse]" : ""}`}>
        {row.map((item, i) => (
          <Fragment key={i}>
            <span className="font-display text-3xl font-semibold tracking-tight text-transparent [-webkit-text-stroke:1px_var(--stroke)] transition-colors duration-300 hover:text-mint md:text-5xl">
              {item}
            </span>
            <LeafIcon className="h-6 w-6 shrink-0 text-leaf/70" />
          </Fragment>
        ))}
      </div>
    </div>
  )
}
