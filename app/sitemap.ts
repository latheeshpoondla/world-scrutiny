import type { MetadataRoute } from "next"
import { getAllPosts } from "@/lib/posts"
import { site } from "@/lib/site"

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = site.nav.map((n) => ({ url: `${site.url}${n.href === "/" ? "" : n.href}`, changeFrequency: "weekly" as const, priority: n.href === "/" ? 1 : 0.7 }))
  const posts = getAllPosts().map((p) => ({ url: `${site.url}/blog/${p.slug}`, lastModified: p.date, changeFrequency: "monthly" as const, priority: 0.8 }))
  return [...pages, ...posts]
}
