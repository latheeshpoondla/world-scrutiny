import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import ParallaxImage from "@/components/fx/ParallaxImage"
import Reveal from "@/components/fx/Reveal"
import SplitWords from "@/components/fx/SplitWords"
import TiltCard from "@/components/fx/TiltCard"
import SporeField from "@/components/fx/SporeField"
import Aurora from "@/components/fx/Aurora"
import { ArrowUpRight, Facebook, LinkedIn, Mail, XIcon, YouTube } from "@/components/Icons"
import { site } from "@/lib/site"

export const metadata: Metadata = {
  title: "About",
  description: `Meet ${site.author.name}, the author of World Scrutiny.`,
}

const links = [
  { label: "Email", href: `mailto:${site.email}`, Icon: Mail },
  { label: "LinkedIn", href: site.socials.linkedin, Icon: LinkedIn },
  { label: "Twitter", href: site.socials.twitter, Icon: XIcon },
  { label: "Facebook", href: site.socials.facebook, Icon: Facebook },
  { label: "YouTube", href: site.socials.youtube, Icon: YouTube },
]

const timeline = [
  { when: "July 2024", title: "World Scrutiny goes live", text: "The first home of WS launches on WordPress with a simple promise: there is so much to know." },
  { when: "July 2024", title: "The first stories", text: "A two-part series on distraction and a summary of James Clear’s Atomic Habits open the journal." },
  { when: "Today", title: "WS on YouTube", text: "Ideas on knowledge, wisdom and technology, told through video on the WS channel." },
  { when: "2026", title: "A new home, hand-built", text: "World Scrutiny moves to its own site, built from scratch with Next.js and Three.js." },
]

export default function AboutPage() {
  return (
    <>
      {/* Cinematic header */}
      <section className="relative h-[78vh] min-h-[520px] overflow-hidden">
        <ParallaxImage src="/WS_Media/Autobiography/Design.png" alt="A traveller on a hilltop looking out over a city, mountains and planets" strength={120} className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-b from-bg/70 via-bg/30 to-bg" />
        <SporeField density={0.00005} />
        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-6 pb-16 md:px-10">
          <Reveal y={16}>
            <p className="eyebrow">About</p>
          </Reveal>
          <SplitWords as="h1" animateOnMount text="The author of WS." highlight={["WS."]} delay={0.15} className="mt-5 font-display text-5xl font-semibold tracking-tight md:text-8xl" />
        </div>
      </section>

      <section className="relative mx-auto grid max-w-7xl gap-14 px-6 py-24 md:px-10 lg:grid-cols-[380px_1fr]">
        <Reveal>
          <TiltCard max={12}>
            <div className="p-3">
              <div className="relative aspect-[3/4] overflow-hidden rounded-[22px] [transform:translateZ(40px)]">
                <Image src={site.author.photo} alt={site.author.name} fill priority sizes="380px" className="object-cover transition-transform duration-[1.2s] group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-bg/90 via-transparent to-transparent" />
                <div className="absolute inset-x-5 bottom-5">
                  <p className="font-display text-2xl font-semibold">{site.author.name}</p>
                  <p className="text-sm text-muted">{site.author.role}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 p-4 [transform:translateZ(30px)]">
                {links.map(({ label, href, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    aria-label={label}
                    className="grid h-11 w-11 place-items-center rounded-full border border-line text-muted transition hover:-translate-y-1 hover:border-leaf hover:text-leaf hover:shadow-[0_0_20px_-4px_var(--leaf)]"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
          </TiltCard>
        </Reveal>

        <div className="lg:pt-6">
          <Reveal>
            <p className="font-display text-3xl font-medium leading-snug md:text-4xl">
              World Scrutiny is a platform where I share <span className="text-gradient">intriguing and valuable insights</span> from my journey.
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="mt-8 space-y-5 text-lg leading-relaxed text-muted">
              <p>
                I am an Electronics &amp; Communication Engineering student at the National Institute of Technology Calicut. Between circuits and
                code, I keep exploring the bigger questions: how we focus, how habits shape us, and how technology and nature can live in balance.
              </p>
              <p>
                Everything here, from the posts and the projects to the videos, is a note from that exploration. If something resonates, I would love to hear from you.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.25}>
            <div className="mt-10 border-l-2 border-leaf pl-6">
              <p className="text-muted">Yours sincerely,</p>
              <p className="mt-1 font-display text-2xl font-semibold italic">{site.author.name}</p>
            </div>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/contact" className="btn btn-primary">Get in touch</Link>
              <a href={site.author.notion} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
                My life voyage <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Journey timeline */}
      <section className="relative overflow-hidden py-24">
        <Aurora variant="cyan" className="[mask-image:linear-gradient(to_bottom,transparent,#000_20%,#000_80%,transparent)]" />
        <div className="relative mx-auto max-w-5xl px-6 md:px-10">
          <Reveal>
            <p className="eyebrow">The journey so far</p>
            <h2 className="mt-5 font-display text-4xl font-semibold tracking-tight md:text-5xl">How WS grew.</h2>
          </Reveal>
          <ol className="relative mt-14 space-y-8 before:absolute before:bottom-0 before:left-[15px] before:top-0 before:w-px before:bg-gradient-to-b before:from-leaf before:via-line-strong before:to-transparent md:before:left-1/2">
            {timeline.map((t, i) => (
              <li key={t.title} className={`relative grid gap-4 pl-12 md:grid-cols-2 md:pl-0 ${i % 2 ? "" : "md:[&>div]:col-start-2"}`}>
                <span className="absolute left-[7px] top-6 h-4 w-4 rounded-full border-2 border-leaf bg-bg shadow-[0_0_14px_var(--leaf)] md:left-1/2 md:-translate-x-1/2" />
                <Reveal delay={0.05 * i} className={i % 2 ? "md:pr-12 md:text-right" : "md:pl-12"}>
                  <div className="glass glow-border rounded-3xl p-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-lime">{t.when}</p>
                    <h3 className="mt-2 font-display text-xl font-semibold">{t.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{t.text}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  )
}
