import Link from "next/link"
import LazyScene from "@/components/three/LazyScene"
import Aurora from "@/components/fx/Aurora"
import Reveal from "@/components/fx/Reveal"
import SplitWords from "@/components/fx/SplitWords"
import Magnetic from "@/components/fx/Magnetic"
import { ArrowRight, ArrowUpRight } from "@/components/Icons"
import { projects } from "@/content/projects"

export default function ProjectsShowcase() {
  return (
    <section data-theme="dark" className="relative mx-2 overflow-hidden rounded-[40px] bg-bg py-28 md:mx-4 md:py-36">
      <Aurora variant="gold" className="[mask-image:linear-gradient(to_bottom,transparent,#000_20%,#000_80%,transparent)]" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-6 md:px-10 lg:grid-cols-2">
        <div className="relative order-2 h-[440px] md:h-[600px] lg:order-1">
          <div aria-hidden className="absolute inset-[15%] rounded-full bg-gold/15 blur-[90px]" />
          <LazyScene scene="orb" className="absolute inset-0 cursor-grab" />
        </div>

        <div className="order-1 lg:order-2">
          <Reveal y={16}>
            <p className="eyebrow !text-gold [&::before]:!bg-[linear-gradient(90deg,transparent,var(--gold))]">Projects</p>
          </Reveal>
          <SplitWords
            text="Generating a living future, one project at a time."
            highlight={["living", "future,"]}
            className="mt-5 font-display text-4xl font-semibold leading-[1.08] tracking-tight md:text-5xl"
          />
          <Reveal delay={0.2} y={16}>
            <p className="mt-6 text-lg leading-relaxed text-muted">
              Explore a diverse array of projects that showcase my passion for discovery and innovation. From groundbreaking tech
              solutions to creative endeavors, each project reflects a unique journey into the unknown.
            </p>
          </Reveal>

          <ul className="mt-10 divide-y divide-line border-y border-line">
            {projects.map((p, i) => (
              <Reveal key={p.title} delay={0.1 * i} y={16}>
                <li>
                  <a
                    href={p.href ?? "/projects"}
                    {...(p.href?.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="group flex items-center gap-5 py-5"
                  >
                    <span className="font-display text-sm text-gold/70">0{i + 1}</span>
                    <span className="flex-1">
                      <span className="block font-display text-xl font-semibold transition-colors group-hover:text-gold">{p.title}</span>
                      <span className="mt-1 block text-sm text-dim">{p.tags.join(" · ")}</span>
                    </span>
                    <span className="grid h-10 w-10 place-items-center rounded-full border border-line transition-all duration-300 group-hover:rotate-45 group-hover:border-gold group-hover:bg-[#f6c96b] group-hover:text-ink">
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </a>
                </li>
              </Reveal>
            ))}
          </ul>

          <Reveal delay={0.3} y={16}>
            <Magnetic className="mt-10">
              <Link href="/projects" className="btn btn-ghost group !border-gold/60 !text-gold hover:!bg-gold/10">
                All projects <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Magnetic>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
