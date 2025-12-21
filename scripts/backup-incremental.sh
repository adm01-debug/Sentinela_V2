#!/bin/bash
set -e
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR=/backups/incremental
mkdir -p $BACKUP_DIR
pg_dump $DATABASE_URL --data-only > $BACKUP_DIR/data_$DATE.sql
echo '✅ Incremental backup completed'