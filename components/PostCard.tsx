import Image from "next/image"
import Link from "next/link"
import TiltCard from "@/components/fx/TiltCard"
import { ArrowUpRight, Clock } from "@/components/Icons"
import { formatDate } from "@/lib/format"
import type { PostMeta } from "@/lib/posts"

export default function PostCard({ post, priority = false, featured = false }: { post: PostMeta; priority?: boolean; featured?: boolean }) {
  return (
    <TiltCard max={featured ? 6 : 10}>
      <Link href={`/blog/${post.slug}`} className={`flex h-full flex-col p-3 ${featured ? "md:grid md:grid-cols-[1.2fr_1fr] md:gap-2" : ""}`}>
        <div className={`relative overflow-hidden rounded-[22px] [transform:translateZ(30px)] ${featured ? "aspect-[16/10] md:aspect-auto md:min-h-[360px]" : "aspect-[16/10]"}`}>
          <Image
            src={post.cover}
            alt=""
            fill
            priority={priority}
            sizes={featured ? "(min-width: 768px) 60vw, 100vw" : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"}
            className="object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg/90 via-bg/10 to-transparent" />
          {/* scanning light */}
          <div aria-hidden className="absolute inset-0 overflow-hidden opacity-0 transition-opacity duration-500 group-hover:opacity-100">
            <div className="h-1/2 w-full bg-gradient-to-b from-transparent via-mint/15 to-transparent [animation:scan_2.2s_linear_infinite]" />
          </div>
          <span className="absolute left-4 top-4 rounded-full border border-white/15 bg-black/45 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#7dffc4] backdrop-blur-md">
            {post.category}
          </span>
        </div>

        <div className={`flex flex-1 flex-col px-3 pb-3 pt-5 [transform:translateZ(45px)] ${featured ? "md:justify-center md:px-6" : ""}`}>
          <div className="flex items-center gap-3 text-xs text-dim">
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            <span className="h-1 w-1 rounded-full bg-leaf/60" />
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> {post.readingMinutes} min read
            </span>
          </div>
          <h3 className={`mt-3 font-display font-semibold leading-snug tracking-tight text-text transition-colors group-hover:text-mint ${featured ? "text-2xl md:text-4xl" : "text-xl"}`}>
            {post.title}
          </h3>
          <p className={`mt-3 text-sm leading-relaxed text-muted ${featured ? "line-clamp-4 md:text-base" : "line-clamp-3"}`}>{post.excerpt}</p>
          <span className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-semibold text-lime">
            Read more
            <span className="grid h-7 w-7 place-items-center rounded-full border border-lime/40 transition-all duration-300 group-hover:rotate-45 group-hover:bg-[#c4f56a] group-hover:text-ink">
              <ArrowUpRight className="h-3.5 w-3.5" />
            </span>
          </span>
        </div>
      </Link>
    </TiltCard>
  )
}
