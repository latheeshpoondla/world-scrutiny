"use client"

import { useEffect } from "react"
import Particles from "@tsparticles/react"
import { loadFull } from "tsparticles"

export default function NetworkBackground() {
  useEffect(() => {
    loadFull
  }, [])

  return (
    <Particles
      id="tsparticles"
      options={{
        background: { color: "transparent" },
        particles: {
          number: { value: 60 },
          color: { value: "#00ffcc" },
          links: {
            enable: true,
            color: "#00ffcc",
            distance: 150,
            opacity: 0.4,
          },
          move: {
            enable: true,
            speed: 1,
          },
          size: { value: 2 },
        },
        interactivity: {
          events: {
            onHover: { enable: true, mode: "grab" },
          },
          modes: {
            grab: {
              distance: 200,
              links: { opacity: 1 },
            },
          },
        },
      }}
      className="absolute inset-0 -z-10"
    />
  )
}