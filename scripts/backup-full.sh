#!/bin/bash
set -e
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR=/backups/full
mkdir -p $BACKUP_DIR
pg_dump $DATABASE_URL > $BACKUP_DIR/backup_$DATE.sql
tar -czf $BACKUP_DIR/files_$DATE.tar.gz /data
echo '✅ Full backup completed'