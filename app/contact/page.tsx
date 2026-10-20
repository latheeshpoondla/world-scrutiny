import type { Metadata } from "next"
import PageHero from "@/components/PageHero"
import SignalOrb from "@/components/art/SignalOrb"
import Reveal from "@/components/fx/Reveal"
import TiltCard from "@/components/fx/TiltCard"
import ContactForm from "@/components/ContactForm"
import { ArrowUpRight, Facebook, LinkedIn, Mail, XIcon, YouTube } from "@/components/Icons"
import { site } from "@/lib/site"

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with World Scrutiny.",
}

const channels = [
  { label: "Email", value: site.email, href: `mailto:${site.email}`, Icon: Mail },
  { label: "YouTube", value: "@WorldScrutiny1", href: site.socials.youtube, Icon: YouTube },
  { label: "LinkedIn", value: "latheesh-poondla", href: site.socials.linkedin, Icon: LinkedIn },
  { label: "Facebook", value: "WorldScrutiny", href: site.socials.facebook, Icon: Facebook },
  { label: "X / Twitter", value: "@LatheeshP5", href: site.socials.twitter, Icon: XIcon },
]

export default function ContactPage() {
  return (
    <>
      <PageHero
        variant="cyan"
        art={<SignalOrb className="h-full w-full" color="var(--cyan)" accent="var(--leaf)" />}
        eyebrow="Contact"
        title="Let’s start a conversation."
        highlight={["conversation."]}
        intro="Questions, ideas, feedback or collaborations: every message is read. Pick whichever channel suits you."
      />
      <section className="mx-auto grid max-w-7xl gap-8 px-6 md:px-10 lg:grid-cols-[1fr_1.2fr]">
        <div className="grid content-start gap-4">
          {channels.map(({ label, value, href, Icon }, i) => (
            <Reveal key={label} delay={i * 0.07}>
              <TiltCard max={5} glow="rgba(63,224,255,0.18)">
                <a href={href} {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="flex items-center gap-4 p-5">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-cyan/20 to-leaf/10 text-cyan ring-1 ring-cyan/30 [transform:translateZ(25px)]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="flex-1 [transform:translateZ(15px)]">
                    <span className="block text-xs uppercase tracking-[0.2em] text-dim">{label}</span>
                    <span className="block break-all font-medium">{value}</span>
                  </span>
                  <ArrowUpRight className="h-5 w-5 text-muted transition group-hover:rotate-45 group-hover:text-cyan" />
                </a>
              </TiltCard>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.15}>
          <ContactForm />
        </Reveal>
      </section>
    </>
  )
}
