/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      }
    ],
    domains: ['placehold.co', 'rlvvgvpprwwcgwqvqwvx.supabase.co']
  },
}

module.exports = nextConfig 