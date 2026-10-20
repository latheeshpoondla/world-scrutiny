import Link from "next/link"
import Hero from "@/components/home/Hero"
import Pillars from "@/components/home/Pillars"
import ProjectsShowcase from "@/components/home/ProjectsShowcase"
import AuthorAndVoices from "@/components/home/AuthorAndVoices"
import YouTubeBand from "@/components/home/YouTubeBand"
import ScrollQuote from "@/components/home/ScrollQuote"
import Marquee from "@/components/fx/Marquee"
import Reveal from "@/components/fx/Reveal"
import PostCard from "@/components/PostCard"
import SectionHeading from "@/components/SectionHeading"
import { ArrowRight } from "@/components/Icons"
import { getAllPosts } from "@/lib/posts"

export default function Home() {
  const posts = getAllPosts().slice(0, 3)

  return (
    <>
      <Hero />

      <div className="relative border-y border-line bg-bg-2/60 py-6">
        <Marquee items={["Knowledge", "Self Improvement", "Habits", "Focus", "Nature", "Technology", "Exploration", "Wisdom"]} />
      </div>

      <Pillars />

      <section className="relative mx-auto max-w-7xl px-6 pb-28 md:px-10">
        <SectionHeading
          eyebrow="Latest posts"
          title="Fresh from the journal."
          highlight={["journal."]}
          intro="Dive into a world of insightful analysis and captivating stories, with fresh perspectives on the wonders around you."
          action={
            <Link href="/blog" className="btn btn-ghost group">
              All posts <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          }
        />
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, i) => (
            <Reveal key={post.slug} delay={i * 0.12} className="h-full">
              <PostCard post={post} />
            </Reveal>
          ))}
        </div>
      </section>

      <ScrollQuote />

      <ProjectsShowcase />

      <div className="pt-20">
        <AuthorAndVoices />
      </div>

      <YouTubeBand />
    </>
  )
}
