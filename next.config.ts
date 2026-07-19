import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep pdf-parse and its native canvas dependency outside the Turbopack bundle.
  serverExternalPackages: [
    "pdf-parse",
    "@napi-rs/canvas",
    "@prisma/client",
    ".prisma/client",
  ],
};

export default nextConfig;
