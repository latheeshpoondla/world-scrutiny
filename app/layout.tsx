import type { Metadata, Viewport } from "next"
import { Plus_Jakarta_Sans, Sora } from "next/font/google"
import "./globals.css"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import SmoothScroll from "@/components/fx/SmoothScroll"
import CursorGlow from "@/components/fx/CursorGlow"
import type { SearchItem } from "@/components/layout/SearchPalette"
import { getAllPosts } from "@/lib/posts"
import { site } from "@/lib/site"

const sora = Sora({ subsets: ["latin"], variable: "--font-sora", display: "swap" })
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta", display: "swap" })

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} – ${site.tagline}`, template: `%s · ${site.name}` },
  description: site.description,
  openGraph: { type: "website", siteName: site.name, title: site.name, description: site.description, images: ["/WS_Media/Page%20Media/World%20Scrutiny.png"] },
  twitter: { card: "summary_large_image", creator: "@LatheeshP5" },
  icons: { icon: "/favicon.ico" },
  alternates: { types: { "application/rss+xml": "/feed.xml" } },
}

export const viewport: Viewport = { themeColor: "#020906" }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const searchIndex: SearchItem[] = [
    ...getAllPosts().map((p) => ({ title: p.title, href: `/blog/${p.slug}`, kind: "Post" as const, text: `${p.category} · ${p.tags.join(", ")} · ${p.excerpt}` })),
    ...site.nav.map((n) => ({ title: n.label, href: n.href, kind: "Page" as const, text: `${site.name} ${n.label}` })),
  ]

  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning className={`${sora.variable} ${jakarta.variable}`}>
      <head>
        {/* Apply the saved theme before first paint to avoid a flash */}
        <script dangerouslySetInnerHTML={{ __html: `try{var t=localStorage.getItem("ws-theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}` }} />
      </head>
      <body className="min-h-screen">
        <a href="#main" className="sr-only z-[100] rounded-full bg-leaf px-4 py-2 text-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
          Skip to content
        </a>
        <SmoothScroll />
        <CursorGlow />
        <Header searchIndex={searchIndex} />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
