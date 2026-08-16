import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: [
    "preview-chat-6184759e-73dd-409a-a293-5645734adec6.space-z.ai",
  ],
};

export default nextConfig;
