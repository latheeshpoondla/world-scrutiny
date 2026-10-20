import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import Aurora from "@/components/fx/Aurora"
import Reveal from "@/components/fx/Reveal"
import ReadingProgress from "@/components/fx/ReadingProgress"
import SplitWords from "@/components/fx/SplitWords"
import PostCard from "@/components/PostCard"
import Toc from "@/components/Toc"
import ShareBar from "@/components/ShareBar"
import { ArrowLeft, ArrowRight, Calendar, Clock } from "@/components/Icons"
import { formatDate } from "@/lib/format"
import { getAdjacent, getAllPosts, getPost, getRelated } from "@/lib/posts"
import { site } from "@/lib/site"

type Props = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }))
}

export const dynamicParams = false

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) return {}
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: { type: "article", title: post.title, description: post.excerpt, publishedTime: post.date, images: [post.cover], tags: post.tags },
  }
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) notFound()
  const { newer, older } = getAdjacent(slug)
  const related = getRelated(slug)

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    datePublished: post.date,
    image: post.cover.startsWith("http") ? post.cover : `${site.url}${post.cover}`,
    author: { "@type": "Person", name: site.author.name },
    publisher: { "@type": "Organization", name: site.name },
    description: post.excerpt,
  }

  return (
    <article>
      <ReadingProgress />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <header className="relative overflow-hidden pt-36 md:pt-44">
        <Aurora />
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <Reveal y={16}>
            <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-muted transition hover:text-mint">
              <ArrowLeft className="h-4 w-4" /> Back to the journal
            </Link>
          </Reveal>
          <Reveal y={16} delay={0.1}>
            <Link href={`/blog?category=${encodeURIComponent(post.category)}`} className="mt-8 inline-block rounded-full border border-leaf/40 bg-leaf/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-mint">
              {post.category}
            </Link>
          </Reveal>
          <SplitWords as="h1" animateOnMount text={post.title} delay={0.2} className="mt-6 font-display text-4xl font-semibold leading-[1.08] tracking-tight md:text-6xl" />
          <Reveal y={16} delay={0.5}>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-muted">
              <span className="flex items-center gap-2">
                <span className="relative h-8 w-8 overflow-hidden rounded-full ring-1 ring-leaf/60">
                  <Image src={site.author.photo} alt="" fill sizes="32px" className="object-cover" />
                </span>
                {site.author.name}
              </span>
              <span className="flex items-center gap-2"><Calendar className="h-4 w-4 text-leaf" /> {formatDate(post.date)}</span>
              <span className="flex items-center gap-2"><Clock className="h-4 w-4 text-leaf" /> {post.readingMinutes} min read</span>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.6} className="relative mx-auto mt-14 max-w-6xl px-4 md:px-10">
          <div className="glow-border relative aspect-[16/8] overflow-hidden rounded-[32px] shadow-[0_40px_120px_-30px_rgba(62,224,143,0.35)]">
            <Image src={post.cover} alt="" fill priority sizes="(min-width: 1200px) 1100px, 100vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-bg/60 to-transparent" />
          </div>
        </Reveal>
      </header>

      <div className="mx-auto mt-16 grid max-w-6xl gap-12 px-6 md:px-10 lg:grid-cols-[1fr_260px]">
        <div className="min-w-0">
          <div className="prose-ws mx-auto max-w-[720px]" dangerouslySetInnerHTML={{ __html: post.html }} />

          {post.tags.length > 0 && (
            <div className="mx-auto mt-14 flex max-w-[720px] flex-wrap gap-2 border-t border-line pt-8">
              {post.tags.map((t) => (
                <Link key={t} href={`/blog?tag=${encodeURIComponent(t)}`} className="rounded-full border border-line px-3 py-1 text-xs text-muted transition hover:border-lime hover:text-lime">
                  #{t}
                </Link>
              ))}
            </div>
          )}

          {/* Author box */}
          <div className="glass glow-border mx-auto mt-10 flex max-w-[720px] flex-col gap-6 rounded-3xl p-6 sm:flex-row sm:items-center">
            <span className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl ring-1 ring-leaf/50">
              <Image src={site.author.photo} alt={site.author.name} fill sizes="80px" className="object-cover" />
            </span>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-dim">Written by</p>
              <p className="mt-1 font-display text-xl font-semibold">{site.author.name}</p>
              <p className="mt-1 text-sm text-muted">{site.author.role}. Sharing intriguing and valuable insights from the journey.</p>
              <Link href="/about" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-lime">
                More about the author <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Prev / next */}
          <nav className="mx-auto mt-10 grid max-w-[720px] gap-4 sm:grid-cols-2" aria-label="More posts">
            {older ? (
              <Link href={`/blog/${older.slug}`} className="glass group rounded-3xl p-6 transition hover:border-line-strong">
                <span className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-dim"><ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-1" /> Previous</span>
                <span className="mt-2 block font-display font-semibold group-hover:text-mint">{older.title}</span>
              </Link>
            ) : <span />}
            {newer && (
              <Link href={`/blog/${newer.slug}`} className="glass group rounded-3xl p-6 text-right transition hover:border-line-strong">
                <span className="flex items-center justify-end gap-2 text-xs uppercase tracking-[0.2em] text-dim">Next <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
                <span className="mt-2 block font-display font-semibold group-hover:text-mint">{newer.title}</span>
              </Link>
            )}
          </nav>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-28 space-y-6">
            {post.headings.length > 0 && <Toc headings={post.headings} />}
            <ShareBar title={post.title} />
          </div>
        </aside>
      </div>

      <div className="mx-auto mt-10 max-w-[720px] px-6 lg:hidden">
        <ShareBar title={post.title} />
      </div>

      {related.length > 0 && (
        <section className="mx-auto mt-28 max-w-7xl px-6 md:px-10">
          <p className="eyebrow">Keep exploring</p>
          <h2 className="mt-4 font-display text-3xl font-semibold md:text-4xl">Related reads</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p, i) => (
              <Reveal key={p.slug} delay={i * 0.1} className="h-full">
                <PostCard post={p} />
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </article>
  )
}
