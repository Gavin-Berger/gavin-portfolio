import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Every page is static, so `next build` writes a plain site to out/ for Cloudflare Pages.
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  // Lets a build run alongside `npm run dev` without both writing to .next.
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  // A lockfile further up the disk confuses root detection; pin it to this project.
  turbopack: { root: __dirname },
};

export default nextConfig;
