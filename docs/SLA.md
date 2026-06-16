# Service Level Agreement (SLA)

## Overview
Service level objectives and agreements for Sentinela.

## Availability

### Uptime Commitment
| Tier | Monthly Uptime | Max Downtime |
|------|---------------|--------------|
| Enterprise | 99.99% | 4.32 minutes |
| Business | 99.9% | 43.2 minutes |
| Standard | 99.5% | 3.6 hours |

### Scheduled Maintenance
- Window: Sundays 2:00-4:00 AM UTC
- Advance notice: 72 hours minimum
- Not counted against uptime SLA

## Performance

### Response Time SLOs
| Endpoint Type | P50 | P95 | P99 |
|--------------|-----|-----|-----|
| API Read | 50ms | 200ms | 500ms |
| API Write | 100ms | 300ms | 800ms |
| Dashboard Load | 1s | 3s | 5s |
| Report Generation | 5s | 15s | 30s |

### Throughput
- API: 10,000 requests/second
- WebSocket: 100,000 concurrent connections
- File Upload: 100MB/file, 1GB/day per user

## Support

### Response Times
| Priority | Initial Response | Resolution Target |
|----------|-----------------|-------------------|
| Critical | 15 minutes | 4 hours |
| High | 1 hour | 8 hours |
| Medium | 4 hours | 24 hours |
| Low | 24 hours | 72 hours |

### Support Channels
- Email: support@sentinela.app (24/7)
- Chat: In-app (Business hours)
- Phone: Enterprise tier (24/7)

## Data

### Backup & Recovery
| Metric | Commitment |
|--------|------------|
| RPO (Recovery Point Objective) | 1 hour |
| RTO (Recovery Time Objective) | 4 hours |
| Backup Retention | 30 days |

### Data Security
- Encryption at rest: AES-256
- Encryption in transit: TLS 1.3
- Annual security audits
- SOC 2 Type II compliant

## Credits

### Downtime Credits
| Monthly Uptime | Credit |
|----------------|--------|
| < 99.9% | 10% |
| < 99.5% | 25% |
| < 99.0% | 50% |
| < 95.0% | 100% |

### Exclusions
- Scheduled maintenance
- Customer-caused issues
- Force majeure events
- Third-party service outages

## Monitoring

### Status Page
- URL: status.sentinela.app
- Real-time system status
- Incident history
- Maintenance schedule

### Metrics Reporting
- Monthly uptime reports
- Performance metrics dashboard
- Incident summaries

## Related Documentation
- [INCIDENT_RESPONSE.md](./INCIDENT_RESPONSE.md)
- [COMPLIANCE_GUIDE.md](./COMPLIANCE_GUIDE.md)

