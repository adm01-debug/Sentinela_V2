#!/bin/bash
set -e
echo 'Generating types from database...'
npx supabase gen types typescript --local > src/types/database.ts
echo '✅ Types generated'