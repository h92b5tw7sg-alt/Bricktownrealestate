import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Renderings, floor plans and brochure PDFs upload through server actions.
  experimental: { serverActions: { bodySizeLimit: "50mb" } },
  images: { unoptimized: true },
};

export default nextConfig;
