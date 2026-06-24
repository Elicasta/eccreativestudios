/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  poweredByHeader: false,
  reactStrictMode: false,
  experimental: {
    outputFileTracingExcludes: {
      "*": ["legacy/**/*", "**/*.md"],
    },
  },
};

export default nextConfig;
