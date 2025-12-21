#!/bin/bash
set -e
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
echo "Starting backup..."
mkdir -p $BACKUP_DIR
supabase db dump -f "$BACKUP_DIR/db_$TIMESTAMP.sql"
echo "Backup completed!"
