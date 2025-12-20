#!/bin/bash

echo "🚀 Setting up Sentinela..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required. Please install Node.js 18+"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Copy environment file
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please update .env with your credentials"
fi

# Generate types
echo "🔧 Generating types..."
npm run generate:types 2>/dev/null || true

# Run migrations
echo "🗄️ Running database migrations..."
npx supabase db push 2>/dev/null || echo "⚠️  Skipping migrations (Supabase not configured)"

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env with your Supabase credentials"
echo "2. Run 'npm run dev' to start development server"
