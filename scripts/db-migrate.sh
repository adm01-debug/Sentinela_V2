#!/bin/bash
set -e
echo 'Running migrations...'
npx supabase db push
echo '✅ Migrations completed'