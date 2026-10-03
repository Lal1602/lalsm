import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  images: {
    // Automatic resize + AVIF/WebP conversion is back on — certificate
    // images now get served as compressed, right-sized variants.
    formats: ["image/avif", "image/webp"],
  },
  // Blog posts are .mdx files imported by the /blog routes (not file routes),
  // so pageExtensions stays at its default.
  poweredByHeader: false,
  async headers() {
    return [
      {
        // Everything under /vendor is versioned by filename; let browsers keep it.
        source: "/vendor/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

const withMDX = createMDX({});

export default withMDX(nextConfig);
