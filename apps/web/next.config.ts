import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@notiving/shared"],
  reactCompiler: true,
  async headers() {
    return [
      {
        source: "/.well-known/apple-app-site-association",
        headers: [{ key: "Content-Type", value: "application/json" }],
      },
    ];
  },
};

export default nextConfig;
