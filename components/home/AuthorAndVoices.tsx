import Image from "next/image"
import Link from "next/link"
import Reveal from "@/components/fx/Reveal"
import TiltCard from "@/components/fx/TiltCard"
import { ArrowUpRight, Quote } from "@/components/Icons"
import { site } from "@/lib/site"

/** Two large interactive cards: "Know the author" and "What people think" (mirrors the WordPress home). */
export default function AuthorAndVoices() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-10 md:px-10">
      <div className="grid gap-6 md:grid-cols-2">
        <Reveal data-theme="dark">
          <TiltCard max={7}>
            <Link href="/about" className="relative block h-[420px] overflow-hidden rounded-[28px]">
              <Image
                src="/WS_Media/Post%20Media/man-sitting-on-wooden-dock-in-front-of-lake-and-mountains-during-daytime.jpg"
                alt=""
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover opacity-70 transition-transform duration-[1.4s] group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-8 [transform:translateZ(50px)]">
                <div className="mb-5 flex items-center gap-3">
                  <span className="relative h-14 w-14 overflow-hidden rounded-full ring-2 ring-leaf/70 ring-offset-2 ring-offset-bg">
                    <Image src={site.author.photo} alt={site.author.name} fill sizes="56px" className="object-cover" />
                  </span>
                  <span className="text-sm">
                    <span className="block font-semibold">{site.author.name}</span>
                    <span className="block text-muted">Author of WS</span>
                  </span>
                </div>
                <p className="eyebrow">About</p>
                <h3 className="mt-3 flex items-center justify-between font-display text-3xl font-semibold md:text-4xl">
                  Know the author of WS
                  <ArrowUpRight className="h-7 w-7 text-lime transition-transform duration-300 group-hover:rotate-45" />
                </h3>
              </div>
            </Link>
          </TiltCard>
        </Reveal>

        <Reveal delay={0.15} data-theme="dark">
          <TiltCard max={7} glow="rgba(246,201,107,0.2)">
            <Link href="/testimonials" className="relative block h-[420px] overflow-hidden rounded-[28px]">
              <Image src="/WS_Media/Page%20Media/crowd.jpg" alt="" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover opacity-50 grayscale transition duration-[1.4s] group-hover:scale-110 group-hover:grayscale-0" />
              <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/70 to-bg/20" />
              <Quote className="absolute right-8 top-8 h-16 w-16 text-gold/30 [transform:translateZ(40px)]" />
              <div className="absolute inset-x-0 bottom-0 p-8 [transform:translateZ(50px)]">
                <p className="eyebrow !text-gold [&::before]:!bg-[linear-gradient(90deg,transparent,var(--gold))]">Testimonials</p>
                <h3 className="mt-3 flex items-center justify-between font-display text-3xl font-semibold md:text-4xl">
                  See what people think about WS
                  <ArrowUpRight className="h-7 w-7 shrink-0 text-gold transition-transform duration-300 group-hover:rotate-45" />
                </h3>
              </div>
            </Link>
          </TiltCard>
        </Reveal>
      </div>
    </section>
  )
}
