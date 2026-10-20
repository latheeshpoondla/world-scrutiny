/** Soft, slowly drifting colour fields + grid used behind sections. Pure CSS. */
export default function Aurora({
  variant = "green",
  grid = true,
  className = "",
}: {
  variant?: "green" | "gold" | "cyan"
  grid?: boolean
  className?: string
}) {
  const palette = {
    green: ["rgba(62,224,143,0.20)", "rgba(196,245,106,0.10)", "rgba(63,224,255,0.08)"],
    gold: ["rgba(246,201,107,0.16)", "rgba(62,224,143,0.12)", "rgba(196,245,106,0.07)"],
    cyan: ["rgba(63,224,255,0.14)", "rgba(62,224,143,0.14)", "rgba(125,255,196,0.07)"],
  }[variant]
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <div className="absolute -left-[10%] -top-[20%] h-[60vmax] w-[60vmax] rounded-full blur-[110px]" style={{ background: palette[0], animation: "aurora 22s ease-in-out infinite" }} />
      <div className="absolute -right-[15%] top-[20%] h-[50vmax] w-[50vmax] rounded-full blur-[120px]" style={{ background: palette[1], animation: "aurora 28s ease-in-out infinite reverse" }} />
      <div className="absolute bottom-[-25%] left-[25%] h-[45vmax] w-[45vmax] rounded-full blur-[120px]" style={{ background: palette[2], animation: "aurora 32s ease-in-out infinite" }} />
      {grid && <div className="absolute inset-0 grid-bg" />}
    </div>
  )
}
