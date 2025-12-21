# Backup & Restore

## Overview

This document describes the backup and restore procedures for Sentinela.

## Backup Strategy

### Database Backups
- **Frequency**: Every 6 hours
- **Retention**: 30 days
- **Type**: Full + incremental

### File Storage Backups
- **Frequency**: Daily
- **Retention**: 90 days
- **Includes**: Screenshots, exports, uploads

## Automated Backups

Supabase handles automated backups:
- Point-in-time recovery (PITR)
- Daily snapshots
- Cross-region replication (Pro plan)

## Manual Backup

```bash
# Export database
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Backup storage
supabase storage cp -r storage/ ./backup/storage/
```

## Restore Procedures

### Database Restore
```bash
# Restore from backup
psql $DATABASE_URL < backup_20240101.sql
```

### Point-in-Time Recovery
1. Go to Supabase Dashboard
2. Navigate to Database > Backups
3. Select restore point
4. Confirm restoration

## Disaster Recovery

### RTO (Recovery Time Objective)
- Critical systems: 1 hour
- Non-critical: 4 hours

### RPO (Recovery Point Objective)
- Database: 5 minutes
- Files: 24 hours

## Testing

Backup restoration is tested:
- Monthly in staging
- Quarterly in production replica
