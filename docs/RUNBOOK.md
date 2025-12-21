# Operations Runbook

## Service Overview

Sentinela is a employee monitoring platform.

## Health Checks

```bash
# API Health
curl https://api.sentinela.app/health

# Database
SELECT 1;

# Edge Functions
curl https://xxx.supabase.co/functions/v1/health
```

## Common Issues

### High CPU Usage
1. Check for runaway queries
2. Review recent deployments
3. Scale if needed

### Database Connection Issues
1. Check connection pool
2. Verify credentials
3. Check network

### Slow API Responses
1. Check database queries
2. Review cache hit rates
3. Check for N+1 queries

## Rollback Procedure

```bash
# Revert to previous version
git revert HEAD
git push origin main

# Or deploy specific version
npm run deploy -- --version=1.2.3
```

## Contacts

- Engineering: #engineering
- On-call: PagerDuty
- Security: security@company.com
