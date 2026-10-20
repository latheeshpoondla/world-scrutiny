import type { Metadata } from "next"
import { Suspense } from "react"
import PageHero from "@/components/PageHero"
import BlogExplorer from "@/components/BlogExplorer"
import CircuitLeaf from "@/components/art/CircuitLeaf"
import { getAllPosts, getCategories } from "@/lib/posts"

export const metadata: Metadata = {
  title: "Blog",
  description: "Dive into a world of insightful analysis and captivating stories. Explore diverse topics with a fresh perspective.",
}

export default function BlogPage() {
  const posts = getAllPosts()
  const categories = getCategories()
  const tags = [...new Set(posts.flatMap((p) => p.tags))].sort()

  return (
    <>
      <PageHero
        art={<CircuitLeaf className="h-full w-full" />}
        eyebrow="The journal"
        title="Stories that make you think twice."
        highlight={["think", "twice."]}
        intro="Dive into a world of insightful analysis and captivating stories. Explore diverse topics with a fresh perspective and discover the wonders around you."
      />
      <section className="mx-auto max-w-7xl px-6 md:px-10">
        <Suspense>
          <BlogExplorer posts={posts} categories={categories} tags={tags} />
        </Suspense>
      </section>
    </>
  )
}
