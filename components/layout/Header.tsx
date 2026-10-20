"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion"
import { useEffect, useState } from "react"
import LeafMark from "@/components/LeafMark"
import { Close, Menu, Search } from "@/components/Icons"
import SearchPalette, { type SearchItem } from "./SearchPalette"
import ThemeToggle from "./ThemeToggle"
import { site } from "@/lib/site"

export default function Header({ searchIndex }: { searchIndex: SearchItem[] }) {
  const pathname = usePathname()
  const { scrollY } = useScroll()
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [hovered, setHovered] = useState<string | null>(null)

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0
    setScrolled(y > 30)
    setHidden(y > 400 && y > prev && !menuOpen)
  })

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setSearchOpen((v) => !v)
      }
      if (e.key === "/" && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href))
  const desktopNav = site.nav.filter((n) => n.href !== "/")

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: hidden ? -110 : 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-x-0 top-0 z-50 px-4 pt-4 md:px-8"
      >
        <div
          className={`header-pill mx-auto flex max-w-7xl items-center justify-between rounded-full px-4 py-2.5 transition-all duration-500 md:px-6 ${
            scrolled ? "glass shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)]" : "border border-transparent"
          }`}
        >
          <Link href="/" className="group flex items-center gap-3" aria-label={`${site.name} home`}>
            <LeafMark className="h-10 w-10 transition-transform duration-500 group-hover:rotate-[-8deg] group-hover:scale-110" />
            <span className="leading-tight">
              <span className="block font-display text-lg font-semibold tracking-tight text-text">{site.name}</span>
              <span className="block text-[11px] tracking-wide text-muted">{site.tagline}</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" onMouseLeave={() => setHovered(null)}>
            {desktopNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onMouseEnter={() => setHovered(item.href)}
                className={`relative rounded-full px-4 py-2 text-sm font-medium transition-colors ${isActive(item.href) ? "text-ink" : "text-muted hover:text-text"}`}
              >
                {isActive(item.href) && (
                  <motion.span layoutId="nav-active" className="absolute inset-0 rounded-full bg-gradient-to-r from-[#c4f56a] to-[#3ee08f] shadow-[0_0_20px_rgba(62,224,143,0.5)]" transition={{ type: "spring", stiffness: 350, damping: 30 }} />
                )}
                {hovered === item.href && !isActive(item.href) && (
                  <motion.span layoutId="nav-hover" className="absolute inset-0 rounded-full bg-white/[0.06]" transition={{ type: "spring", stiffness: 350, damping: 30 }} />
                )}
                <span className="relative">{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 rounded-full border border-line bg-white/[0.03] px-3 py-2 text-sm text-muted transition hover:border-line-strong hover:text-text"
              aria-label="Search posts"
            >
              <Search className="h-4 w-4" />
              <span className="hidden md:inline">Search</span>
              <kbd className="hidden rounded-md border border-line px-1.5 text-[10px] text-dim md:inline">Ctrl K</kbd>
            </button>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="rounded-full border border-line p-2 text-text lg:hidden"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <Close className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ clipPath: "circle(0% at 100% 0%)" }}
            animate={{ clipPath: "circle(150% at 100% 0%)" }}
            exit={{ clipPath: "circle(0% at 100% 0%)" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-40 flex flex-col justify-center bg-bg/95 px-8 backdrop-blur-xl lg:hidden"
          >
            <nav className="flex flex-col gap-2">
              {site.nav.map((item, i) => (
                <motion.div key={item.href} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.06 }}>
                  <Link href={item.href} onClick={() => setMenuOpen(false)} className={`font-display text-4xl font-semibold ${isActive(item.href) ? "text-gradient" : "text-text"}`}>
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </nav>
            <p className="mt-12 text-sm text-muted">{site.email}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <SearchPalette open={searchOpen} onClose={() => setSearchOpen(false)} items={searchIndex} />
    </>
  )
}
