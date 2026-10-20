"use client"

import { motion, type HTMLMotionProps } from "framer-motion"

type Props = HTMLMotionProps<"div"> & { delay?: number; y?: number; blur?: boolean }

/** Fades + lifts its children into view the first time they scroll on screen. */
export default function Reveal({ delay = 0, y = 40, blur = true, children, ...rest }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y, filter: blur ? "blur(8px)" : "blur(0px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
      {...rest}
    >
      {children}
    </motion.div>
  )
}
