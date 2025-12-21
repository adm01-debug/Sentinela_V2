#!/bin/bash
set -e
DATE=$(date +%Y%m%d)
pg_dump $DATABASE_URL > backup_$DATE.sql
gzip backup_$DATE.sql
echo '✅ Database backup: backup_$DATE.sql.gz'