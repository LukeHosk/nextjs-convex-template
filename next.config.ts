import './env/next'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Convex file storage — cloud deployments
      {
        protocol: 'https',
        hostname: '*.convex.site',
        pathname: '/api/storage/**',
      },
      // Convex file storage — local dev backend
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        pathname: '/api/storage/**',
      },
    ],
  },
}

export default nextConfig
