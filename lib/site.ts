// Central site configuration. Edit links, copy and socials here.

export const site = {
  name: "World Scrutiny",
  short: "WS",
  tagline: "There is so much to Know",
  description:
    "World Scrutiny is a platform where I share intriguing and valuable insights from my journey: knowledge, self-improvement, technology and the wonders of our planet.",
  // Set NEXT_PUBLIC_SITE_URL in your hosting env to your real domain (used for SEO, sitemap, RSS).
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  author: {
    name: "Latheesh Poondla",
    role: "Electronics & Communication Engineering, NIT Calicut",
    photo: "https://scrutinyworld.wordpress.com/wp-content/uploads/2024/08/latheeshpoondlapropic.jpg?w=768",
    notion: "https://www.notion.so/My-Life-Voyage-Latheesh-Poondla-178ccc7c8a5d4d618ae80475cdf67b5b?pvs=21",
  },
  email: "worldscrutiny@gmail.com",
  // Paste a YouTube video id (e.g. "dQw4w9WgXcQ") to play the intro inside the site.
  // Leave empty and "Watch WS Intro" opens the channel instead.
  introVideoId: "",
  socials: {
    youtube: "https://www.youtube.com/@WorldScrutiny1",
    facebook: "https://www.facebook.com/WorldScrutiny/",
    linkedin: "https://www.linkedin.com/in/latheesh-poondla",
    twitter: "https://twitter.com/LatheeshP5",
  },
  nav: [
    { label: "Home", href: "/" },
    { label: "Blog", href: "/blog" },
    { label: "Projects", href: "/projects" },
    { label: "About", href: "/about" },
    { label: "Testimonials", href: "/testimonials" },
    { label: "Contact", href: "/contact" },
  ],
} as const

export type Site = typeof site
