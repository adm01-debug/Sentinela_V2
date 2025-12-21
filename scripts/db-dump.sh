#!/bin/bash
set -e
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
echo "💾 Creating database dump..."
npx supabase db dump -f "backups/db_$TIMESTAMP.sql"
echo "✅ Dump saved to backups/db_$TIMESTAMP.sql"
