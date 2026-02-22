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
  output: 'standalone',  // Optimiert für Deployment (Pages/Workers)
  experimental: {
    webpackBuildWorker: false,  // Verhindert große webpack-Packs [web:38]
  },
  webpack: (config) => {
    // Preact-Alias für ~50% React-Reduktion (npm i -D preact)
    config.resolve.alias = {
      ...config.resolve.alias,
      react: 'preact/compat',
      'react-dom': 'preact/compat',
    };
    // Chunk-Splitting: Max 20 MB pro Chunk
    config.optimization!.splitChunks = {
      ...config.optimization!.splitChunks,
      maxSize: 20 * 1024 * 1024,  // 20 MiB [web:32]
    };
    return config;
  },
};

export default nextConfig;
