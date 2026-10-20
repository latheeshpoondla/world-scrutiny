import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "scrutinyworld.wordpress.com" },
      { protocol: "https", hostname: "*.wp.com" },
    ],
  },
  // Keep old WordPress-style links working if this site takes over the WS domain.
  async redirects() {
    return [
      { source: "/:year(\\d{4})/:month(\\d{2})/:day(\\d{2})/:slug", destination: "/blog/:slug", permanent: true },
      { source: "/portfolio", destination: "/projects", permanent: true },
      { source: "/testimonial", destination: "/testimonials", permanent: true },
    ]
  },
}

export default nextConfig
