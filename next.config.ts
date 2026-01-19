/** @type {import('next').NextConfig} */
const imageDomains = process.env.NEXT_IMAGE_DOMAINS?.split(",").map((d) => d.trim()) ?? [];

const nextConfig = {
  images: {
    domains: imageDomains,
  },

  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  turbopack: {},
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
      stream: false,
      util: false,
      buffer: false,
      encoding: false,
    };

    return config;
  },
};

export default nextConfig;
