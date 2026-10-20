import fs from "node:fs"
import path from "node:path"
import { Marked } from "marked"

/*
  Posts live in /content/posts/<slug>.md with a small frontmatter block:

  ---
  title: "My post"
  date: "2026-01-31"
  excerpt: "One or two lines shown on cards."
  cover: "/WS_Media/Post%20Media/image.jpeg"
  category: "Self Improvement"
  tags: ["Habits", "Focus"]
  ---
*/

export type PostMeta = {
  slug: string
  title: string
  date: string
  excerpt: string
  cover: string
  category: string
  tags: string[]
  readingMinutes: number
}

export type Heading = { id: string; text: string; level: 2 | 3 }

export type Post = PostMeta & { html: string; headings: Heading[] }

const POSTS_DIR = path.join(process.cwd(), "content", "posts")

function parseFrontmatter(raw: string): { data: Record<string, unknown>; body: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!match) return { data: {}, body: raw }
  const data: Record<string, unknown> = {}
  for (const line of match[1].split(/\r?\n/)) {
    const kv = line.match(/^(\w+):\s*(.*)$/)
    if (!kv) continue
    const [, key, value] = kv
    try {
      data[key] = JSON.parse(value)
    } catch {
      data[key] = value.replace(/^["']|["']$/g, "")
    }
  }
  return { data, body: match[2] }
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/&[a-z0-9#]+;/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
}

function stripInline(text: string) {
  return text.replace(/<[^>]+>/g, "").replace(/[*_`]/g, "").replace(/\\/g, "").trim()
}

function render(body: string) {
  const headings: Heading[] = []
  const used = new Map<string, number>()
  const marked = new Marked({
    gfm: true,
    renderer: {
      heading({ tokens, depth }) {
        const html = this.parser.parseInline(tokens)
        const text = stripInline(html)
        let id = slugify(text) || "section"
        const n = used.get(id) ?? 0
        used.set(id, n + 1)
        if (n) id = `${id}-${n}`
        if (depth === 2 || depth === 3) headings.push({ id, text, level: depth })
        return `<h${depth} id="${id}"><a class="anchor" href="#${id}" aria-hidden="true">#</a>${html}</h${depth}>`
      },
      image({ href, title, text }) {
        const cap = title || text
        return `<figure><img src="${href}" alt="${text ?? ""}" loading="lazy" />${cap ? `<figcaption>${cap}</figcaption>` : ""}</figure>`
      },
      link({ href, title, tokens }) {
        const inner = this.parser.parseInline(tokens)
        const external = /^https?:\/\//.test(href)
        return `<a href="${href}"${title ? ` title="${title}"` : ""}${external ? ' target="_blank" rel="noopener noreferrer"' : ""}>${inner}</a>`
      },
    },
  })
  const html = marked.parse(body, { async: false }) as string
  return { html, headings }
}

function readingMinutes(body: string) {
  const words = body.replace(/[#>*_`!\[\]()-]/g, " ").split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 220))
}

function loadFile(file: string): Post {
  const slug = file.replace(/\.md$/, "")
  const raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf8")
  const { data, body } = parseFrontmatter(raw)
  const { html, headings } = render(body)
  return {
    slug,
    title: String(data.title ?? slug),
    date: String(data.date ?? "1970-01-01"),
    excerpt: String(data.excerpt ?? ""),
    cover: String(data.cover ?? "/WS_Media/Page%20Media/abstract.jpg"),
    category: String(data.category ?? "Uncategorized"),
    tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
    readingMinutes: readingMinutes(body),
    html,
    headings,
  }
}

let cache: Post[] | null = null

function all(): Post[] {
  if (cache && process.env.NODE_ENV === "production") return cache
  const files = fs.existsSync(POSTS_DIR) ? fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md")) : []
  cache = files.map(loadFile).sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.title.localeCompare(b.title)))
  return cache
}

const toMeta = (p: Post): PostMeta => ({
  slug: p.slug,
  title: p.title,
  date: p.date,
  excerpt: p.excerpt,
  cover: p.cover,
  category: p.category,
  tags: p.tags,
  readingMinutes: p.readingMinutes,
})

export function getAllPosts(): PostMeta[] {
  return all().map(toMeta)
}

export function getPost(slug: string): Post | undefined {
  return all().find((p) => p.slug === slug)
}

export function getAdjacent(slug: string) {
  const posts = all()
  const i = posts.findIndex((p) => p.slug === slug)
  return {
    newer: i > 0 ? toMeta(posts[i - 1]) : undefined,
    older: i >= 0 && i < posts.length - 1 ? toMeta(posts[i + 1]) : undefined,
  }
}

export function getRelated(slug: string, limit = 3): PostMeta[] {
  const post = getPost(slug)
  if (!post) return []
  return all()
    .filter((p) => p.slug !== slug)
    .map((p) => ({ p, score: (p.category === post.category ? 2 : 0) + p.tags.filter((t) => post.tags.includes(t)).length }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ p }) => toMeta(p))
}

export function getCategories() {
  const counts = new Map<string, number>()
  for (const p of all()) counts.set(p.category, (counts.get(p.category) ?? 0) + 1)
  return [...counts.entries()].map(([name, count]) => ({ name, count }))
}
