#!/bin/bash
set -e
if [ -z "$1" ]; then echo 'Usage: ./restore.sh <backup_file>'; exit 1; fi
psql $DATABASE_URL < $1
echo 'Restore complete'