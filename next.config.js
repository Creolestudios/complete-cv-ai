/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  // productionBrowserSourceMaps: true,
  image: {
    domains: ["http://localhost:3000", "localhost"],
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer }) => {
    // Add a rule for handling .node files
    config.module.rules.push({
      test: /\.node$/,
      use: "node-loader",
    });

    // You may need to exclude some dependencies from being processed by webpack
    if (!isServer) {
      config.externals = {
        canvas: "commonjs canvas", // replace 'canvas' with the actual module name causing the issue
      };
    }

    return config;
  },
};

module.exports = nextConfig;
