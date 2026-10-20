"use client"

import { useState } from "react"
import { Mail } from "@/components/Icons"
import { site } from "@/lib/site"

const topics = ["Say hello", "Feedback on a post", "Collaboration", "Something else"]

/** Composes the message and hands it to the visitor's email app; no server or third-party form service needed. */
export default function ContactForm() {
  const [topic, setTopic] = useState(topics[0])
  const [name, setName] = useState("")
  const [message, setMessage] = useState("")

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const subject = `${topic}${name ? ` from ${name}` : ""}`
    window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`
  }

  const field = "w-full rounded-2xl border border-line bg-field px-4 py-3.5 text-text outline-none transition placeholder:text-dim focus:border-leaf focus:shadow-[0_0_0_4px_rgba(62,224,143,0.12)]"

  return (
    <form onSubmit={submit} className="glass glow-border rounded-[32px] p-6 md:p-10">
      <h2 className="font-display text-2xl font-semibold">Write a message</h2>
      <p className="mt-2 text-sm text-muted">Sending opens your email app with everything filled in.</p>

      <fieldset className="mt-8">
        <legend className="text-xs font-semibold uppercase tracking-[0.2em] text-mint">Topic</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {topics.map((t) => (
            <button
              type="button"
              key={t}
              onClick={() => setTopic(t)}
              aria-pressed={topic === t}
              className={`rounded-full border px-4 py-2 text-sm transition ${topic === t ? "border-leaf bg-leaf/15 text-mint" : "border-line text-muted hover:text-text"}`}
            >
              {t}
            </button>
          ))}
        </div>
      </fieldset>

      <label className="mt-6 block">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-mint">Your name</span>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="How should I address you?" className={`mt-3 ${field}`} />
      </label>

      <label className="mt-6 block">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-mint">Message</span>
        <textarea required rows={6} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="What’s on your mind?" className={`mt-3 resize-none ${field}`} />
      </label>

      <button type="submit" className="btn btn-primary mt-8 w-full justify-center">
        <Mail className="h-4 w-4" /> Send message
      </button>
    </form>
  )
}
