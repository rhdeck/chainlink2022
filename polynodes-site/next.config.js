/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  target: "serverless",
  // async rewrites() {
  //   return [
  //     // Rewrite everything to `pages/index`
  //     {
  //       source: "/:any*",
  //       destination: "/",
  //     },
  //   ];
  // },
};

module.exports = nextConfig;
