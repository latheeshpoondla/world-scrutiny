import ParallaxImage from "@/components/fx/ParallaxImage"
import Reveal from "@/components/fx/Reveal"
import SplitWords from "@/components/fx/SplitWords"
import Magnetic from "@/components/fx/Magnetic"
import { ArrowUpRight, Play, YouTube } from "@/components/Icons"
import { site } from "@/lib/site"

export default function YouTubeBand() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-28 md:px-10">
      <Reveal>
        <div data-theme="dark" className="glow-border relative overflow-hidden rounded-[40px] bg-bg">
          <ParallaxImage src="/WS_Media/Page%20Media/sunset-1373171.jpg" alt="" className="absolute inset-0" strength={60} />
          <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/85 to-bg/30" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_50%,rgba(255,60,60,0.18),transparent_50%)]" />

          <div className="relative grid items-center gap-10 p-8 md:grid-cols-[1.3fr_1fr] md:p-16">
            <div>
              <p className="eyebrow">
                <YouTube className="h-4 w-4 text-[#ff4d4d]" /> WS on YouTube
              </p>
              <SplitWords
                text="Where the journey is as exhilarating as the destination."
                highlight={["exhilarating"]}
                className="mt-5 font-display text-4xl font-semibold leading-[1.08] tracking-tight md:text-5xl"
              />
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
                Welcome to a world of limitless possibilities, where every moment is an opportunity to make your mark on the canvas
                of existence.
              </p>
              <Magnetic className="mt-10">
                <a href={site.socials.youtube} target="_blank" rel="noopener noreferrer" className="btn bg-[#ff3b3b] text-white shadow-[0_10px_40px_-8px_rgba(255,59,59,0.8)] hover:bg-[#ff5252]">
                  <YouTube className="h-5 w-5" /> Go to YouTube <ArrowUpRight className="h-4 w-4" />
                </a>
              </Magnetic>
            </div>

            <a href={site.socials.youtube} target="_blank" rel="noopener noreferrer" aria-label="Open the World Scrutiny YouTube channel" className="group relative mx-auto grid h-44 w-44 place-items-center md:h-56 md:w-56">
              <span className="absolute inset-0 rounded-full border border-white/10 [animation:spin_18s_linear_infinite]">
                <svg viewBox="0 0 200 200" className="h-full w-full">
                  <defs>
                    <path id="ytCircle" d="M100,100 m-82,0 a82,82 0 1,1 164,0 a82,82 0 1,1 -164,0" />
                  </defs>
                  <text className="fill-white/60 text-[13px] uppercase tracking-[0.35em]">
                    <textPath href="#ytCircle">Watch · Learn · Explore · Subscribe ·</textPath>
                  </text>
                </svg>
              </span>
              <span className="relative grid h-24 w-24 place-items-center rounded-full bg-[#ff3b3b] text-white shadow-[0_0_60px_rgba(255,59,59,0.7)] transition-transform duration-500 group-hover:scale-110 pulse-ring">
                <Play className="h-9 w-9 translate-x-0.5" />
              </span>
            </a>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
