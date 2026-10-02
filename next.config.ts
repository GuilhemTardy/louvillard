import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Les fichiers de démo et le filigrane sont lus à l'exécution par les fonctions serveur.
  outputFileTracingIncludes: {
    "/**": ["./seed/**/*", "./assets/**/*"],
  },
  serverExternalPackages: ["sharp", "exifr"],
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
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

export default nextConfig;
