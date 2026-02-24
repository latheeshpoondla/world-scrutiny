export default function Navbar() {
  return (
    <nav className="fixed w-full backdrop-blur-xl bg-black/30 border-b border-green-400/20 px-12 py-5 flex justify-between items-center z-50">
      <h1 className="text-green-400 font-bold text-2xl tracking-wider drop-shadow-[0_0_10px_rgba(0,255,200,0.7)]">
        WORLD SCRUTINY
      </h1>

      <div className="space-x-8 text-gray-300">
        <a href="#" className="hover:text-green-400 transition">About</a>
        <a href="#" className="hover:text-green-400 transition">Blog</a>
        <a href="#" className="hover:text-green-400 transition">Projects</a>
      </div>
    </nav>
  )
}