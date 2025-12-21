# Recovery Procedures

## Database
```bash
supabase db restore backup.sql
```

## Files
```bash
scripts/restore.sh backup.tar.gz
```

## Verification
- Check data integrity
- Verify connections
- Test critical flows