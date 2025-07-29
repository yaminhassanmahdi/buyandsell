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
    ],
    domains: (process.env.NEXT_PUBLIC_IMAGE_DOMAINS || 'images.unsplash.com,placehold.co,2ndhandbajar.com').split(','),
  },
};

export default nextConfig;
