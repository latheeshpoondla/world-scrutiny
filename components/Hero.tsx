"use client"

import { motion } from "framer-motion"
import Particles from "@tsparticles/react"

export default function Hero() {

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#02120f] via-[#062a23] to-[#031f1a]">

      {/* Glowing Background Blobs */}
      <div className="absolute w-[500px] h-[500px] bg-green-500/20 rounded-full blur-3xl top-[-100px] left-[-100px]" />
      <div className="absolute w-[400px] h-[400px] bg-emerald-400/20 rounded-full blur-3xl bottom-[-100px] right-[-100px]" />

      {/* Particle Network */}
      <Particles
        id="tsparticles"
        options={{
          background: { color: "transparent" },
          particles: {
            number: { value: 60 },
            color: { value: "#17ceaa" },
            links: {
              enable: true,
              color: "#00ffcc",
              distance: 140,
              opacity: 0.5,
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
        className="absolute inset-0 z-0"
      />

      {/* Glass Content Card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="relative z-10 backdrop-blur-xl bg-white/5 border border-green-400/20 p-12 rounded-3xl shadow-2xl text-center max-w-3xl"
      >
        <h1 className="text-5xl md:text-6xl font-bold text-green-400 drop-shadow-[0_0_15px_rgba(0,255,200,0.7)]">
          We Don't Just Build Technology.
          <br />
          We Cultivate A New World.
        </h1>

        <p className="mt-6 text-gray-300 text-lg leading-relaxed">
          World Scrutiny is where knowledge meets innovation.
          From AI & ML to nature-integrated technology,
          we explore ideas that shape a sustainable future.
        </p>

        <div className="mt-8 flex justify-center gap-6">
          <button className="px-8 py-3 bg-green-400 text-black font-semibold rounded-full shadow-[0_0_20px_rgba(0,255,200,0.6)] hover:scale-105 transition">
            Explore Blog
          </button>

          <button className="px-8 py-3 border border-green-400 text-green-400 rounded-full hover:bg-green-400 hover:text-black transition">
            View Projects
          </button>
        </div>
      </motion.div>

    </section>
  )
}