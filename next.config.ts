import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  distDir: 'output',
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
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  output: 'export',
  experimental: {
    webpackBuildWorker: false,  // Vermeidet große Packs
  },
  webpack: (config) => {
    // KEIN Preact-Alias – dnd-kit braucht echtes React
    config.optimization!.splitChunks = {
      ...config.optimization!.splitChunks,
      maxSize: 20 * 1024 * 1024,  // 20 MiB/Chunks
    };
    
    // Disable webpack cache for Cloudflare Pages deployment
    config.cache = false;
    
    return config;
  },
};

export default nextConfig;
