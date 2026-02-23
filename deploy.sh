#!/bin/bash

echo "🚀 Starting Cloudflare deployment..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf .next .open-next output

# Build for Cloudflare
echo "🔨 Building for Cloudflare..."
npm run build:cloudflare

# Deploy to Cloudflare
echo "☁️ Deploying to Cloudflare..."
npm run deploy:wrangler

echo "✅ Deployment complete!"
