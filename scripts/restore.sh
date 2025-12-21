#!/bin/bash
set -e
BACKUP=$1
[ -z "$BACKUP" ] && echo "Usage: restore.sh <file>" && exit 1
echo "Restoring from $BACKUP..."
psql $DATABASE_URL < $BACKUP
echo "Restore completed!"
