#!/bin/bash
set -e
echo "🚀 Initializing project..."
cp .env.example .env
npm install
npx supabase start
npm run db:migrate
npm run db:seed
echo "✅ Project initialized! Run 'npm run dev' to start"
