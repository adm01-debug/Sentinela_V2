#!/bin/bash
set -e
read -p 'This will reset the database. Continue? (y/n) ' -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  npx supabase db reset
  echo '✅ Database reset'
fi