import type { Metadata } from "next"
import Image from "next/image"
import PageHero from "@/components/PageHero"
import SignalOrb from "@/components/art/SignalOrb"
import Reveal from "@/components/fx/Reveal"
import TiltCard from "@/components/fx/TiltCard"
import LazyScene from "@/components/three/LazyScene"
import { ArrowUpRight, Mail } from "@/components/Icons"
import { projects } from "@/content/projects"
import { site } from "@/lib/site"

export const metadata: Metadata = {
  title: "Projects",
  description: "A portfolio of projects that showcase a passion for discovery and innovation.",
}

const statusStyle = {
  Live: "bg-leaf/15 text-mint border-leaf/40",
  "In progress": "bg-gold/10 text-gold border-gold/40",
  Idea: "bg-cyan/10 text-cyan border-cyan/40",
}

export default function ProjectsPage() {
  return (
    <>
      <PageHero
        variant="gold"
        art={<SignalOrb className="h-full w-full" color="var(--gold)" accent="var(--gold)" />}
        eyebrow="Portfolio"
        title="Projects born from curiosity."
        highlight={["curiosity."]}
        intro="Explore a diverse array of projects that showcase my passion for discovery and innovation. From tech solutions to creative endeavors, each one reflects a unique journey into the unknown."
      />

      <section className="mx-auto max-w-7xl px-6 md:px-10">
        <div className="grid gap-6 md:grid-cols-2">
          {projects.map((p, i) => {
            const external = p.href?.startsWith("http")
            return (
              <Reveal key={p.title} delay={i * 0.1} className="h-full">
                <TiltCard max={8} glow="rgba(246,201,107,0.2)">
                  <a href={p.href ?? "#"} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="flex h-full flex-col p-3">
                    <div className="relative aspect-[16/9] overflow-hidden rounded-[22px] [transform:translateZ(30px)]">
                      <Image src={p.image} alt="" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover transition-transform duration-[1.2s] group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-bg/80 to-transparent" />
                      <span className={`absolute left-4 top-4 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wider backdrop-blur ${statusStyle[p.status]}`}>{p.status}</span>
                      <span className="absolute right-4 top-4 font-display text-sm text-white/70">{p.year}</span>
                    </div>
                    <div className="flex flex-1 flex-col p-4 pt-6 [transform:translateZ(45px)]">
                      <h2 className="flex items-start justify-between gap-4 font-display text-2xl font-semibold transition-colors group-hover:text-gold">
                        {p.title}
                        <ArrowUpRight className="mt-1 h-5 w-5 shrink-0 transition-transform duration-300 group-hover:rotate-45" />
                      </h2>
                      <p className="mt-3 leading-relaxed text-muted">{p.summary}</p>
                      <div className="mt-auto flex flex-wrap gap-2 pt-6">
                        {p.tags.map((t) => (
                          <span key={t} className="rounded-full border border-line px-3 py-1 text-xs text-dim">{t}</span>
                        ))}
                      </div>
                    </div>
                  </a>
                </TiltCard>
              </Reveal>
            )
          })}
        </div>

        {/* Collaboration band */}
        <Reveal className="mt-20">
          <div data-theme="dark" className="glow-border relative grid items-center overflow-hidden rounded-[36px] bg-bg-2 md:grid-cols-[1fr_1.1fr]">
            <div className="relative h-72 md:h-full md:min-h-[380px]">
              <LazyScene scene="orb" className="absolute inset-0" />
            </div>
            <div className="p-8 md:p-12">
              <p className="eyebrow !text-gold [&::before]:!bg-[linear-gradient(90deg,transparent,var(--gold))]">More on the way</p>
              <h2 className="mt-4 font-display text-3xl font-semibold md:text-4xl">Have an idea worth building together?</h2>
              <p className="mt-4 text-muted">New projects are always growing here. If you would like to collaborate, or have a problem that deserves a closer look, reach out.</p>
              <a href={`mailto:${site.email}?subject=${encodeURIComponent("Project idea for World Scrutiny")}`} className="btn btn-primary mt-8">
                <Mail className="h-4 w-4" /> Pitch an idea
              </a>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  )
}
