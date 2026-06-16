# Monitoring Guide

## Overview

Comprehensive monitoring setup for Sentinela infrastructure and applications.

## Monitoring Stack

- **Prometheus**: Metrics collection
- **Grafana**: Visualization
- **AlertManager**: Alerting
- **Loki**: Log aggregation
- **Jaeger**: Distributed tracing

## Key Metrics

### Application Metrics

| Metric                        | Description           | Alert Threshold |
| ----------------------------- | --------------------- | --------------- |
| http_request_duration_seconds | Request latency       | P99 > 1s        |
| http_requests_total           | Request count         | Error rate > 1% |
| active_connections            | WebSocket connections | > 10,000        |
| queue_depth                   | Background job queue  | > 1,000         |

### Infrastructure Metrics

| Metric               | Description        | Alert Threshold |
| -------------------- | ------------------ | --------------- |
| cpu_usage_percent    | CPU utilization    | > 80%           |
| memory_usage_percent | Memory utilization | > 85%           |
| disk_usage_percent   | Disk utilization   | > 90%           |
| network_in_bytes     | Network ingress    | > 1 Gbps        |

## Dashboards

- **Overview**: High-level system health
- **API Performance**: Request latency and throughput
- **Database**: Query performance and connections
- **Infrastructure**: Resource utilization

## Alerting Rules

```yaml
groups:
  - name: sentinela
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.01
        for: 5m
        labels:
          severity: critical
```

## Related Documentation

- [LOGGING.md](./LOGGING.md)
- [INCIDENT_RESPONSE.md](./INCIDENT_RESPONSE.md)
