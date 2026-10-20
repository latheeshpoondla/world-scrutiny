import Link from "next/link"
import LeafMark from "@/components/LeafMark"
import Aurora from "@/components/fx/Aurora"
import { ArrowUpRight, Facebook, LinkedIn, Mail, Rss, XIcon, YouTube } from "@/components/Icons"
import { site } from "@/lib/site"

const socials = [
  { label: "YouTube", href: site.socials.youtube, Icon: YouTube },
  { label: "Facebook", href: site.socials.facebook, Icon: Facebook },
  { label: "LinkedIn", href: site.socials.linkedin, Icon: LinkedIn },
  { label: "X / Twitter", href: site.socials.twitter, Icon: XIcon },
]

export default function Footer() {
  return (
    <footer className="relative mt-8 overflow-hidden noise">
      <Aurora variant="green" grid={false} className="opacity-60 [mask-image:linear-gradient(to_bottom,transparent,#000_25%)]" />

      <div className="relative mx-auto max-w-7xl px-6 pt-20 md:px-10">
        {/* Subscribe band */}
        <div className="glass glow-border relative overflow-hidden rounded-[32px] p-8 md:p-12">
          <div aria-hidden className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-leaf/20 blur-3xl" />
          <div className="relative grid items-center gap-8 md:grid-cols-[1.4fr_1fr]">
            <div>
              <p className="eyebrow">Stay curious</p>
              <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight md:text-4xl">
                New stories, straight to you.
              </h2>
              <p className="mt-3 max-w-lg text-muted">
                Get a note whenever a new World Scrutiny post goes live. Drop a line by email, or follow the RSS feed in your reader.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 md:justify-end">
              <a href={`mailto:${site.email}?subject=${encodeURIComponent("Subscribe me to World Scrutiny")}`} className="btn btn-primary">
                <Mail className="h-4 w-4" /> Subscribe by email
              </a>
              <a href="/feed.xml" className="btn btn-ghost">
                <Rss className="h-4 w-4" /> RSS
              </a>
            </div>
          </div>
        </div>

        <div className="grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="flex items-center gap-3">
              <LeafMark className="h-12 w-12" />
              <span className="font-display text-xl font-semibold">{site.name}</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">{site.description}</p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-mint">Need help?</h3>
            <ul className="mt-5 space-y-3 text-sm">
              {[
                ["Blog", "/blog"],
                ["About", "/about"],
                ["Portfolio", "/projects"],
                ["Testimonials", "/testimonials"],
              ].map(([l, h]) => (
                <li key={h}>
                  <Link href={h} className="text-muted transition hover:text-text">{l}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-mint">Follow WS</h3>
            <ul className="mt-5 space-y-3 text-sm">
              {socials.map(({ label, href, Icon }) => (
                <li key={label}>
                  <a href={href} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-2 text-muted transition hover:text-text">
                    <Icon className="h-4 w-4 text-leaf" /> {label}
                    <ArrowUpRight className="h-3 w-3 opacity-0 transition group-hover:opacity-100" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-mint">Contact</h3>
            <a href={`mailto:${site.email}`} className="mt-5 inline-block break-all text-sm text-muted transition hover:text-text">
              {site.email}
            </a>
            <Link href="/contact" className="mt-4 flex items-center gap-1 text-sm font-medium text-lime">
              Send a message <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Giant outlined wordmark */}
      <div aria-hidden className="relative select-none overflow-hidden">
        <p className="whitespace-nowrap text-center font-display text-[17vw] font-bold leading-[0.8] tracking-tighter text-transparent [-webkit-text-stroke:1px_color-mix(in_oklab,var(--stroke)_35%,transparent)] [mask-image:linear-gradient(to_bottom,#000_30%,transparent)]">
          SCRUTINY
        </p>
      </div>

      <div className="relative border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-6 text-xs text-dim md:flex-row md:px-10">
          <p>© {new Date().getFullYear()} {site.name}. {site.tagline}.</p>
          <p>Crafted with curiosity by {site.author.name}.</p>
        </div>
      </div>
    </footer>
  )
}
