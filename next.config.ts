import createMDX from "@next/mdx";
import type { NextConfig } from "next";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Pin tracing to this project so Next doesn't pick up a stray lockfile
  // from a parent directory.
  outputFileTracingRoot: __dirname,
  // Allow .mdx alongside .tsx for pages and content imports.
  pageExtensions: ["ts", "tsx", "mdx"],
  images: {
    // Custom loader sends resizes to Sanity's CDN directly (URL params)
    // and falls through for non-Sanity sources. Avoids the `_next/image`
    // proxy hop on the heaviest assets and keeps the global config so
    // we don't have to thread loader props through server→client.
    loader: "custom",
    loaderFile: "./lib/imageLoader.ts",
    remotePatterns: [
      { protocol: "https", hostname: "cdn.sanity.io" },
    ],
  },
};

const withMDX = createMDX({
  extension: /\.mdx?$/,
});

export default withMDX(nextConfig);
