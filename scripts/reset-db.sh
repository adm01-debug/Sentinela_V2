#!/bin/bash
set -e
echo "⚠️ This will reset the database. Continue? (y/n)"
read -r CONFIRM
[ "$CONFIRM" != "y" ] && exit 0
npx supabase db reset
echo "✅ Database reset complete!"
