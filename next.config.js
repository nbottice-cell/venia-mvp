/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Allow production builds even if there are type errors
    ignoreBuildErrors: true,
  },
  eslint: {
    // Allow production builds even if there are ESLint errors
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
