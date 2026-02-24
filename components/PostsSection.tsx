export default function PostsSection() {
  return (
    <section className="py-20 px-10 bg-[#0b2a23]">
      <h2 className="text-4xl font-bold text-primary mb-10">
        Latest Posts
      </h2>

      <div className="grid md:grid-cols-3 gap-10">
        {[1,2,3].map((post) => (
          <div
            key={post}
            className="bg-[#102f28] p-6 rounded-xl border border-primary/30 hover:shadow-glow transition"
          >
            <h3 className="text-xl font-semibold text-primary">
              Sample Post Title
            </h3>
            <p className="text-gray-300 mt-4">
              Short preview of your article content here...
            </p>
            <button className="mt-4 text-primary underline">
              Read more
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}