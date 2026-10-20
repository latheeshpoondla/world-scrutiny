"use client"

import { useState } from "react"
import { Facebook, LinkedIn, XIcon } from "@/components/Icons"

export default function ShareBar({ title }: { title: string }) {
  const [copied, setCopied] = useState(false)

  const share = (network: "x" | "facebook" | "linkedin") => {
    const url = encodeURIComponent(window.location.href)
    const text = encodeURIComponent(title)
    const href = {
      x: `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
    }[network]
    window.open(href, "_blank", "noopener,noreferrer,width=640,height=560")
  }

  const copy = async () => {
    await navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  const btn = "grid h-10 w-10 place-items-center rounded-full border border-line text-muted transition hover:-translate-y-0.5 hover:border-leaf hover:text-leaf"

  return (
    <div className="glass rounded-3xl p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-mint">Share</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button onClick={() => share("x")} className={btn} aria-label="Share on X"><XIcon className="h-4 w-4" /></button>
        <button onClick={() => share("facebook")} className={btn} aria-label="Share on Facebook"><Facebook className="h-4 w-4" /></button>
        <button onClick={() => share("linkedin")} className={btn} aria-label="Share on LinkedIn"><LinkedIn className="h-4 w-4" /></button>
        <button onClick={copy} className="h-10 rounded-full border border-line px-4 text-xs font-medium text-muted transition hover:border-leaf hover:text-leaf">
          {copied ? "Copied ✓" : "Copy link"}
        </button>
      </div>
    </div>
  )
}
