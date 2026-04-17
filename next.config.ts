import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Picsum Photos — used for mock property placeholder images
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      // Supabase Storage — used for live property images uploaded via the CRM
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

export default nextConfig
