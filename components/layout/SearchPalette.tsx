"use client"

import { AnimatePresence, motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { ArrowRight, Search } from "@/components/Icons"

export type SearchItem = { title: string; href: string; kind: "Post" | "Page"; text: string }

export default function SearchPalette({ open, onClose, items }: { open: boolean; onClose: () => void; items: SearchItem[] }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-start justify-center bg-black/60 px-4 pt-[14vh] backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          data-lenis-prevent
        >
          {/* Mounted fresh on every open, so the query always starts empty */}
          <Palette onClose={onClose} items={items} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Palette({ onClose, items }: { onClose: () => void; items: SearchItem[] }) {
  const [q, setQ] = useState("")
  const [active, setActive] = useState(0)
  const router = useRouter()

  const results = useMemo(() => {
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean)
    if (!terms.length) return items.slice(0, 8)
    return items
      .map((it) => {
        const hay = `${it.title} ${it.text}`.toLowerCase()
        const ok = terms.every((t) => hay.includes(t))
        const score = terms.reduce((s, t) => s + (it.title.toLowerCase().includes(t) ? 3 : 1), 0)
        return { it, ok, score }
      })
      .filter((r) => r.ok)
      .sort((a, b) => b.score - a.score)
      .map((r) => r.it)
      .slice(0, 8)
  }, [q, items])

  const go = (href: string) => {
    onClose()
    router.push(href)
  }

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Search"
      initial={{ opacity: 0, y: -20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      onClick={(e) => e.stopPropagation()}
      className="w-full max-w-xl overflow-hidden rounded-3xl glass glow-border shadow-[0_40px_120px_-20px_rgba(0,0,0,0.9)]"
    >
      <div className="flex items-center gap-3 border-b border-line px-5 py-4">
        <Search className="h-5 w-5 text-leaf" />
        <input
          autoFocus
          value={q}
          onChange={(e) => {
            setQ(e.target.value)
            setActive(0)
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") onClose()
            if (e.key === "ArrowDown") {
              e.preventDefault()
              setActive((a) => Math.min(a + 1, results.length - 1))
            }
            if (e.key === "ArrowUp") {
              e.preventDefault()
              setActive((a) => Math.max(a - 1, 0))
            }
            if (e.key === "Enter" && results[active]) go(results[active].href)
          }}
          placeholder="Search posts, pages, ideas…"
          className="w-full bg-transparent text-base text-text outline-none placeholder:text-dim"
        />
        <kbd className="rounded-md border border-line px-1.5 py-0.5 text-[10px] text-dim">ESC</kbd>
      </div>
      <ul className="max-h-[50vh] overflow-y-auto p-2">
        {results.length === 0 && <li className="px-4 py-8 text-center text-sm text-muted">Nothing found for “{q}”. Try another word.</li>}
        {results.map((r, i) => (
          <li key={r.href}>
            <button
              onMouseEnter={() => setActive(i)}
              onClick={() => go(r.href)}
              className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition ${i === active ? "bg-leaf/10" : ""}`}
            >
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${r.kind === "Post" ? "bg-leaf/15 text-mint" : "bg-white/5 text-muted"}`}>{r.kind}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium text-text">{r.title}</span>
                <span className="block truncate text-xs text-muted">{r.text}</span>
              </span>
              <ArrowRight className={`h-4 w-4 shrink-0 transition ${i === active ? "translate-x-0 text-leaf opacity-100" : "-translate-x-2 opacity-0"}`} />
            </button>
          </li>
        ))}
      </ul>
    </motion.div>
  )
}
