import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Automatic resize + AVIF/WebP conversion is back on — certificate
    // images (some 1.7-1.8MB originals) now get served as compressed,
    // right-sized variants instead of the raw upload.
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
