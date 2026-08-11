#!/bin/bash
set -e
echo 'Seeding database...'
npx supabase db push
echo 'Seed complete'