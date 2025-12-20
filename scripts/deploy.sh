#!/bin/bash

set -e

echo "🚀 Deploying Sentinela..."

# Build
echo "📦 Building..."
npm run build

# Run tests
echo "🧪 Running tests..."
npm run test

# Deploy Edge Functions
echo "⚡ Deploying Edge Functions..."
npx supabase functions deploy

# Deploy to Vercel (if configured)
if command -v vercel &> /dev/null; then
    echo "🌐 Deploying to Vercel..."
    vercel --prod
fi

echo "✅ Deployment complete!"
