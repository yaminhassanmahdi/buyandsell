import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '2ndhandbajar.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.vercel.app',
        port: '',
        pathname: '/**',
      },
    ],
    domains: [
      'images.unsplash.com',
      'placehold.co',
      '2ndhandbajar.com',
    ],
    formats: ['image/webp', 'image/avif'],
  },
  // Optimize for Vercel
  experimental: {
    serverComponentsExternalPackages: ['mysql2'],
  },
  // Add output configuration for better performance
  output: 'standalone',
};

export default nextConfig;
