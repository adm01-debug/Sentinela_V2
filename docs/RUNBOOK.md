# Operations Runbook

## Overview

Standard operating procedures for common operational tasks.

## Service Health Checks

### Application Health

```bash
# Check API health
curl -s https://api.sentinela.app/health | jq

# Check all services
kubectl get pods -n sentinela
kubectl top pods -n sentinela
```

### Database Health

```bash
# Connection count
SELECT count(*) FROM pg_stat_activity;

# Replication lag
SELECT NOW() - pg_last_xact_replay_timestamp() AS replication_lag;

# Table sizes
SELECT relname, pg_size_pretty(pg_total_relation_size(relid))
FROM pg_catalog.pg_statio_user_tables
ORDER BY pg_total_relation_size(relid) DESC LIMIT 10;
```

### Redis Health

```bash
redis-cli INFO replication
redis-cli INFO memory
redis-cli DBSIZE
```

## Common Procedures

### Restart Application

```bash
# Rolling restart
kubectl rollout restart deployment/sentinela-api -n sentinela

# Wait for completion
kubectl rollout status deployment/sentinela-api -n sentinela
```

### Scale Application

```bash
# Scale up
kubectl scale deployment/sentinela-api --replicas=10 -n sentinela

# Check status
kubectl get hpa sentinela-api -n sentinela
```

### Database Maintenance

```bash
# Vacuum analyze
VACUUM ANALYZE;

# Reindex
REINDEX DATABASE sentinela;

# Kill long-running queries
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE duration > interval '5 minutes'
AND state = 'active';
```

### Clear Cache

```bash
# Clear all Redis cache
redis-cli FLUSHALL

# Clear specific pattern
redis-cli KEYS "session:*" | xargs redis-cli DEL
```

### Rotate Secrets

```bash
# Update secret
kubectl create secret generic api-secrets \
  --from-literal=DATABASE_URL="$NEW_DB_URL" \
  --dry-run=client -o yaml | kubectl apply -f -

# Restart to pick up new secrets
kubectl rollout restart deployment/sentinela-api -n sentinela
```

## Troubleshooting

### High CPU Usage

1. Check pod metrics: `kubectl top pods`
2. Review recent deployments
3. Check for resource-intensive queries
4. Scale if needed

### High Memory Usage

1. Check for memory leaks in logs
2. Review recent code changes
3. Restart affected pods
4. Adjust resource limits

### Slow API Responses

1. Check database query times
2. Review Redis hit rates
3. Check external service latency
4. Enable debug logging temporarily

### Database Connection Errors

1. Check connection pool usage
2. Verify network connectivity
3. Check RDS proxy status
4. Review security groups

## Monitoring Dashboards

| Dashboard   | URL         | Purpose              |
| ----------- | ----------- | -------------------- |
| Grafana     | /grafana    | Metrics & alerts     |
| Kibana      | /kibana     | Logs & traces        |
| RDS Metrics | AWS Console | Database performance |

## Emergency Contacts

| Role      | Contact   | Availability   |
| --------- | --------- | -------------- |
| On-Call   | PagerDuty | 24/7           |
| Team Lead | Slack     | Business hours |
| CTO       | Phone     | SEV1 only      |

## Related Documentation

- [INCIDENT_RESPONSE.md](./INCIDENT_RESPONSE.md)
- [DISASTER_RECOVERY.md](./DISASTER_RECOVERY.md)
