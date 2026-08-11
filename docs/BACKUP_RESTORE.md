# Backup & Restore Guide

## Overview
Comprehensive backup strategy and disaster recovery procedures.

## Backup Types

### Database Backups
| Type | Frequency | Retention | Location |
|------|-----------|-----------|----------|
| Full Backup | Daily (2 AM UTC) | 30 days | S3 + Cross-region |
| Incremental | Hourly | 7 days | S3 |
| WAL Archives | Continuous | 7 days | S3 |
| Point-in-Time | On-demand | 90 days | S3 Glacier |

### Application Data Backups
| Data Type | Frequency | Retention |
|-----------|-----------|-----------|
| User uploads | Real-time sync | 1 year |
| Screenshots | Daily | 90 days |
| Logs | Daily | 30 days |
| Configuration | On change | Indefinite |

## Backup Procedures

### Automated Database Backup
```bash
#!/bin/bash
# scripts/backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/postgres"
S3_BUCKET="sentinela-backups"

# Create backup
pg_dump -Fc sentinela > "${BACKUP_DIR}/sentinela_${DATE}.dump"

# Compress and encrypt
gpg --encrypt --recipient backup@sentinela.app "${BACKUP_DIR}/sentinela_${DATE}.dump"

# Upload to S3
aws s3 cp "${BACKUP_DIR}/sentinela_${DATE}.dump.gpg" \
  "s3://${S3_BUCKET}/postgres/${DATE}/" \
  --storage-class STANDARD_IA

# Cleanup old backups
find ${BACKUP_DIR} -name "*.dump*" -mtime +7 -delete

echo "Backup completed: sentinela_${DATE}.dump.gpg"
```

### Manual Backup
```bash
# Full database backup
./scripts/backup.sh --full

# Specific tables
pg_dump -t users -t organizations sentinela > users_backup.sql

# Schema only
pg_dump --schema-only sentinela > schema_backup.sql
```

## Restore Procedures

### Database Restore
```bash
#!/bin/bash
# scripts/restore.sh

BACKUP_FILE=$1
DB_NAME=${2:-sentinela}

# Download from S3 if needed
if [[ $BACKUP_FILE == s3://* ]]; then
  aws s3 cp "$BACKUP_FILE" /tmp/restore.dump.gpg
  BACKUP_FILE="/tmp/restore.dump.gpg"
fi

# Decrypt
gpg --decrypt "$BACKUP_FILE" > /tmp/restore.dump

# Stop application
systemctl stop sentinela-api

# Restore
pg_restore -d "$DB_NAME" --clean --if-exists /tmp/restore.dump

# Run migrations
npm run db:migrate

# Restart application
systemctl start sentinela-api

# Verify
npm run db:verify
```

### Point-in-Time Recovery
```bash
# Restore to specific timestamp
pg_restore \
  --target-time="2024-01-15 10:30:00" \
  --target-action=promote \
  sentinela
```

## Verification

### Backup Verification Script
```bash
# Daily verification
./scripts/verify-backup.sh

# Test restore to staging
./scripts/test-restore.sh --env=staging --latest
```

### Monitoring
- Daily backup success alerts
- Weekly restore test reports
- Storage utilization monitoring

## Recovery Time Objectives

| Scenario | RTO | RPO |
|----------|-----|-----|
| Database corruption | 1 hour | 1 hour |
| Regional outage | 4 hours | 15 minutes |
| Complete data loss | 24 hours | 1 hour |

## Related Documentation
- [DISASTER_RECOVERY.md](./DISASTER_RECOVERY.md)
- [INCIDENT_RESPONSE.md](./INCIDENT_RESPONSE.md)

