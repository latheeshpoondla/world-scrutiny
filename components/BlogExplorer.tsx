"use client"

import { AnimatePresence, motion } from "framer-motion"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useMemo, useState } from "react"
import PostCard from "@/components/PostCard"
import { Close, Search } from "@/components/Icons"
import type { PostMeta } from "@/lib/posts"

export default function BlogExplorer({ posts, categories, tags }: { posts: PostMeta[]; categories: { name: string; count: number }[]; tags: string[] }) {
  const params = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const category = params.get("category")
  const tag = params.get("tag")
  const [q, setQ] = useState("")

  const setParam = (key: "category" | "tag", value: string | null) => {
    const next = new URLSearchParams(params.toString())
    if (value) next.set(key, value)
    else next.delete(key)
    const s = next.toString()
    router.replace(s ? `${pathname}?${s}` : pathname, { scroll: false })
  }

  const filtered = useMemo(() => {
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean)
    return posts.filter(
      (p) =>
        (!category || p.category === category) &&
        (!tag || p.tags.includes(tag)) &&
        terms.every((t) => `${p.title} ${p.excerpt} ${p.tags.join(" ")}`.toLowerCase().includes(t))
    )
  }, [posts, category, tag, q])

  const [featured, ...rest] = filtered
  const showFeatured = !q && !category && !tag && featured

  return (
    <div>
      <div className="glass relative z-10 flex flex-col gap-4 rounded-3xl p-3 md:flex-row md:items-center">
        <label className="flex flex-1 items-center gap-3 rounded-2xl bg-field px-4 py-3">
          <Search className="h-4 w-4 text-leaf" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search the journal…" className="w-full bg-transparent text-sm outline-none placeholder:text-dim" />
          {q && (
            <button onClick={() => setQ("")} aria-label="Clear search">
              <Close className="h-4 w-4 text-muted" />
            </button>
          )}
        </label>
        <div className="flex flex-wrap gap-2">
          <Chip active={!category} onClick={() => setParam("category", null)}>
            All <span className="opacity-60">{posts.length}</span>
          </Chip>
          {categories.map((c) => (
            <Chip key={c.name} active={category === c.name} onClick={() => setParam("category", category === c.name ? null : c.name)}>
              {c.name} <span className="opacity-60">{c.count}</span>
            </Chip>
          ))}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {tags.map((t) => (
          <button
            key={t}
            onClick={() => setParam("tag", tag === t ? null : t)}
            className={`rounded-full border px-3 py-1 text-xs transition ${tag === t ? "border-lime bg-lime/15 text-lime" : "border-line text-muted hover:border-line-strong hover:text-text"}`}
          >
            #{t}
          </button>
        ))}
      </div>

      {showFeatured && (
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="mt-12">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-dim">Latest story</p>
          <PostCard post={featured} featured priority />
        </motion.div>
      )}

      <motion.div layout className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {(showFeatured ? rest : filtered).map((post, i) => (
            <motion.div
              key={post.slug}
              layout
              initial={{ opacity: 0, scale: 0.92, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className="h-full"
            >
              <PostCard post={post} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 && (
        <div className="glass mt-12 rounded-3xl p-12 text-center">
          <p className="font-display text-2xl">No posts match that yet.</p>
          <p className="mt-2 text-muted">Try a different word or clear the filters.</p>
        </div>
      )}
    </div>
  )
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`relative rounded-full px-4 py-2 text-sm font-medium transition ${active ? "text-ink" : "text-muted hover:text-text"}`}>
      {active && <motion.span layoutId="blog-chip" className="absolute inset-0 rounded-full bg-gradient-to-r from-[#c4f56a] to-[#3ee08f]" transition={{ type: "spring", stiffness: 350, damping: 30 }} />}
      <span className="relative flex items-center gap-2">{children}</span>
    </button>
  )
}
