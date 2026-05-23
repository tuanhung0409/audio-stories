import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // Supabase Storage
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        // Any https image (covers user-provided cover image URLs)
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
