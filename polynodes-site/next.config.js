/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash:true,
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
