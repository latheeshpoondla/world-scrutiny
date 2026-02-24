"use client"

import Globe from "@/components/Globe"
import { motion } from "framer-motion"

export default function Home() {
  return (
    <div
      className="relative min-h-screen bg-fixed bg-cover bg-center text-white overflow-hidden"
      style={{
        backgroundImage: "url('/WS_Media/Page Media/abstract.jpg')",
      }}
    >
      {/* Animated Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-black/80 animate-gradient z-0" />

      {/* Floating Radial Light Effect */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="w-full h-full bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.15)_0%,transparent_40%),radial-gradient(circle_at_80%_70%,rgba(255,255,255,0.1)_0%,transparent_40%)] animate-pulse"></div>
      </div>

      {/* HEADER */}
      <motion.header
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="relative z-50 flex justify-between items-start px-12 py-6"
      >
        <div className="flex items-start gap-4">
          <img
            src="/WS_Media/Logo/WorldScrutiny1_no_bg.png"
            className="w-14 h-14 transition-transform duration-500 hover:rotate-6 hover:scale-110"
          />
          <div>
            <h1 className="text-3xl font-bold text-green-400">
              World Scrutiny
            </h1>
            <p className="text-gray-300 text-sm">
              There is so much to Know
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-4">
          <nav className="space-x-8 text-lg">
            {["About", "Blog"].map((item) => (
              <a
                key={item}
                href="#"
                className="
                  relative transition-all duration-300
                  hover:text-white
                  after:absolute after:left-0 after:-bottom-1
                  after:h-[2px] after:w-0
                  after:bg-white
                  after:transition-all after:duration-300
                  hover:after:w-full
                "
              >
                {item}
              </a>
            ))}
          </nav>

          <input
            type="text"
            placeholder="Search..."
            className="
              px-4 py-2 bg-white/10
              border border-white/30
              rounded-md backdrop-blur-md
              transition-all duration-300
              focus:outline-none
              focus:border-white
              focus:bg-white/20
              focus:shadow-[0_0_15px_rgba(255,255,255,0.5)]
            "
          />
        </div>
      </motion.header>

      {/* MAIN SECTION */}
      <div className="relative z-10 flex items-center px-20 h-[80vh]">

        {/* GLASS CARD */}
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          whileHover={{ scale: 1.02 }}
          className="
            relative z-10 max-w-4xl w-full
            backdrop-blur-2xl bg-white/5
            border border-white/20
            p-16 rounded-[2.5rem]
            shadow-2xl text-white
            transition-all duration-700
            hover:bg-white/10
            hover:shadow-[0_0_80px_rgba(255,255,255,0.2)]
          "
        >
          <div className="max-w-xl">

            <motion.h2
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-5xl font-bold drop-shadow-[0_0_20px_rgba(255,255,255,0.6)]"
            >
              Discover the world
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 1 }}
              className="mt-6 text-lg leading-relaxed"
            >
              Join me as I explore the wonders of our planet, one adventure at a time.
              From hidden gems to cultural treasures, World Scrutiny brings you closer
              to the heart of every destination.
            </motion.p>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="
                relative mt-8 px-10 py-4
                bg-white text-black font-bold
                rounded-full shadow-xl
                transition-all duration-300
                hover:bg-green-400
                hover:shadow-[0_0_30px_rgba(255,255,255,0.8)]
              "
            >
              Watch WS Intro
            </motion.button>
          </div>
        </motion.div>

        {/* GLOBE: Small and pinned to the right overlap area */}
        <div className="absolute top-0 right-4 w-[50%] h-full z-20 pointer-events-none flex justify-center items-center">
          {/* right-4 moves it further to the right. 
              w-[50%] shrinks the relative container. */}
          <div className="w-[120%] h-[120%] mt-10">
            <Globe />
          </div>
        </div>

      </div>
    </div>
  )
}