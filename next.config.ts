import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/pricing",
        permanent: true,
      },
      {
        source: "/admin",
        destination: "/admin/promos",
        permanent: true
      }
    ];
  },
};

export default nextConfig;
