#!/bin/bash
set -e
echo 'Running migrations...'
npx supabase migration up
echo 'Migrations complete'