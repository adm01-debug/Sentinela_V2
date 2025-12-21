#!/bin/bash
FILE=$1
[ -z "$FILE" ] && echo "Usage: db-restore.sh <file>" && exit 1
echo "⚠️ This will overwrite the database. Continue? (y/n)"
read -r CONFIRM
[ "$CONFIRM" != "y" ] && exit 0
psql "$DATABASE_URL" < "$FILE"
echo "✅ Database restored!"
