// Add your projects here. They show up on the home page and /projects.
// `image` can be a path inside /public or a remote URL from an allowed host (see next.config.ts).

export type Project = {
  title: string
  summary: string
  tags: string[]
  image: string
  href?: string
  status: "Live" | "In progress" | "Idea"
  year: string
}

export const projects: Project[] = [
  {
    title: "World Scrutiny Website",
    summary:
      "This site: a hand-built Next.js home for World Scrutiny with a holographic 3D globe, Markdown-powered blog and animated, interactive cards.",
    tags: ["Next.js", "Three.js", "Design"],
    image: "/WS_Media/Page%20Media/project.jpg",
    href: "/",
    status: "In progress",
    year: "2026",
  },
  {
    title: "WS on YouTube",
    summary:
      "Video essays and explorations from World Scrutiny: ideas on knowledge, wisdom and technology, told one story at a time.",
    tags: ["Video", "Storytelling"],
    image: "/WS_Media/Page%20Media/peakpx.jpg",
    href: "https://www.youtube.com/@WorldScrutiny1",
    status: "Live",
    year: "2024",
  },
]
