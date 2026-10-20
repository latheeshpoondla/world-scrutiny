import Link from "next/link"
import Aurora from "@/components/fx/Aurora"
import LazyScene from "@/components/three/LazyScene"
import { ArrowLeft } from "@/components/Icons"

export default function NotFound() {
  return (
    <section data-theme="dark" className="relative flex min-h-[100svh] items-center overflow-hidden bg-bg noise">
      <Aurora variant="gold" />
      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-6 px-6 pt-24 md:px-10 lg:grid-cols-2">
        <div>
          <p className="eyebrow">Error 404</p>
          <h1 className="mt-6 font-display text-6xl font-semibold tracking-tight md:text-8xl">
            Lost in the <span className="text-gradient">network.</span>
          </h1>
          <p className="mt-6 max-w-md text-lg text-muted">This page wandered off the map. There is still so much to know, just not here.</p>
          <Link href="/" className="btn btn-primary mt-10">
            <ArrowLeft className="h-4 w-4" /> Back home
          </Link>
        </div>
        <div className="relative h-[420px] md:h-[560px]">
          <LazyScene scene="orb" className="absolute inset-0" />
        </div>
      </div>
    </section>
  )
}
