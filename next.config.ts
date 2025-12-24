import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Add an empty turbopack config so Turbopack-aware runs don't error when
  // a webpack override exists. This silences the runtime error during dev.
  turbopack: {},
  // Disable dev source maps parsing to avoid "Invalid source map" warnings
  // caused by non-conformant source maps from some dependencies during dev.
  webpack: (config, { dev }) => {
    if (dev && config) {
      // Turn off generation/parsing of source maps in dev to silence invalid map errors
      // This improves the developer experience when dependencies ship malformed maps.
      // Note: you can remove this if upstream packages fix their source maps.
      // eslint-disable-next-line no-param-reassign
      config.devtool = false as any;
    }
    return config;
  },
};

export default nextConfig;
