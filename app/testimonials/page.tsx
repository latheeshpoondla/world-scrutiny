import type { Metadata } from "next"
import PageHero from "@/components/PageHero"
import CircuitLeaf from "@/components/art/CircuitLeaf"
import Reveal from "@/components/fx/Reveal"
import TiltCard from "@/components/fx/TiltCard"
import { Mail, Quote } from "@/components/Icons"
import { testimonials } from "@/content/testimonials"
import { site } from "@/lib/site"

export const metadata: Metadata = {
  title: "Testimonials",
  description: "See what people are thinking about World Scrutiny.",
}

export default function TestimonialsPage() {
  return (
    <>
      <PageHero
        variant="gold"
        art={<CircuitLeaf tone="gold" className="h-full w-full" />}
        eyebrow="Testimonials"
        title="What people think about WS."
        highlight={["think"]}
        intro="Words from readers, viewers and collaborators who have walked a little of this journey with World Scrutiny."
      />

      <section className="mx-auto max-w-7xl px-6 md:px-10">
        {testimonials.length > 0 ? (
          <div className="columns-1 gap-6 md:columns-2 lg:columns-3">
            {testimonials.map((t, i) => (
              <Reveal key={i} delay={(i % 3) * 0.1} className="mb-6 break-inside-avoid">
                <TiltCard max={6} glow="rgba(246,201,107,0.18)">
                  <figure className="p-8">
                    <Quote className="h-10 w-10 text-gold/50" />
                    <blockquote className="mt-5 text-lg leading-relaxed text-text">“{t.quote}”</blockquote>
                    <figcaption className="mt-6 flex items-center gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-gold/40 to-leaf/30 font-display font-semibold">{t.name[0]}</span>
                      <span>
                        <span className="block font-semibold">{t.name}</span>
                        {t.role && <span className="block text-sm text-dim">{t.role}</span>}
                      </span>
                    </figcaption>
                  </figure>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        ) : (
          <Reveal>
            <div className="glass glow-border relative overflow-hidden rounded-[36px] px-8 py-20 text-center">
              <div aria-hidden className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/15 blur-3xl" />
              <div className="relative">
                <span className="mx-auto grid h-20 w-20 place-items-center rounded-full border border-gold/40 text-gold" style={{ animation: "float 6s ease-in-out infinite" }}>
                  <Quote className="h-9 w-9" />
                </span>
                <h2 className="mt-8 font-display text-3xl font-semibold md:text-4xl">Your words could be the first here.</h2>
                <p className="mx-auto mt-4 max-w-xl text-muted">
                  Has a post, video or idea from World Scrutiny helped you? Share a few lines and they may be featured on this page.
                </p>
                <a href={`mailto:${site.email}?subject=${encodeURIComponent("My testimonial for World Scrutiny")}`} className="btn btn-primary mt-10">
                  <Mail className="h-4 w-4" /> Share your thoughts
                </a>
              </div>
            </div>
          </Reveal>
        )}
      </section>
    </>
  )
}
