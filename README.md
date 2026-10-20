# World Scrutiny

*There is so much to know*

![World Scrutiny](public/WS_Media/Logo/WorldScrutiny1_no_bg.png)

The World Scrutiny website, built with Next.js 16, React Three Fiber, Framer Motion and Tailwind CSS v4.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Editing content

| What | Where |
| --- | --- |
| Blog posts | `content/posts/<slug>.md` (Markdown + frontmatter; the file name becomes the URL) |
| Projects | `content/projects.ts` |
| Testimonials | `content/testimonials.ts` (the page shows an invitation while empty) |
| Name, socials, email, nav, intro video | `lib/site.ts` |

A new post looks like this:

```md
---
title: "My new post"
date: "2026-10-20"
excerpt: "One or two lines for the cards."
cover: "/WS_Media/Post%20Media/image.jpeg"
category: "Self Improvement"
tags: ["Habits", "Focus"]
---

Write the post in Markdown. `##` and `###` headings appear in the table of contents.
```

Set `NEXT_PUBLIC_SITE_URL` to your real domain when deploying (used by SEO tags, the sitemap and `/feed.xml`).

## Structure

- `app/` holds the routes: home, blog, blog posts, about, projects, testimonials, contact, 404, sitemap, robots and the RSS feed
- `components/three/` holds the 3D scenes (holographic globe with the growing plant, golden network orb), loaded only while on screen
- `components/fx/` holds the effects: tilt cards, reveals, parallax, smooth scroll, particles and the cursor glow
- `lib/posts.ts` is the Markdown loader
