#!/bin/bash
NAME=$1
[ -z "$NAME" ] && echo "Usage: create-migration.sh <name>" && exit 1
npx supabase migration new "$NAME"
echo "✅ Migration created!"
