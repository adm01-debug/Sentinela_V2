#!/bin/bash
echo "🔄 Syncing environment..."
npx supabase secrets set --env-file .env.production
echo "✅ Environment synced!"
