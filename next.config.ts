/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "management.arinova.studio",
      "res.cloudinary.com"
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "management.arinova.studio",
        pathname: "/images/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
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
