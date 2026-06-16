# Scaling Guide

## Overview

Horizontal and vertical scaling strategies for Sentinela.

## Architecture

### Current Architecture

```
                    ┌─────────────┐
                    │   Route 53  │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │ CloudFront  │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
        ┌─────▼─────┐┌─────▼─────┐┌─────▼─────┐
        │   ALB 1   ││   ALB 2   ││   ALB 3   │
        └─────┬─────┘└─────┬─────┘└─────┬─────┘
              │            │            │
        ┌─────▼─────┐┌─────▼─────┐┌─────▼─────┐
        │  ECS/K8s  ││  ECS/K8s  ││  ECS/K8s  │
        │  Cluster  ││  Cluster  ││  Cluster  │
        └─────┬─────┘└─────┬─────┘└─────┬─────┘
              │            │            │
              └────────────┼────────────┘
                           │
                    ┌──────▼──────┐
                    │  RDS Proxy  │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
        ┌─────▼─────┐┌─────▼─────┐┌─────▼─────┐
        │  Primary  ││  Replica  ││  Replica  │
        │    RDS    ││    RDS    ││    RDS    │
        └───────────┘└───────────┘└───────────┘
```

## Auto-Scaling Configuration

### Application Tier

```yaml
# kubernetes/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: sentinela-api
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: sentinela-api
  minReplicas: 3
  maxReplicas: 50
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
        - type: Pods
          value: 4
          periodSeconds: 60
    scaleDown:
      stabilizationWindowSeconds: 300
```

### Database Tier

```hcl
# terraform/rds.tf
resource "aws_rds_cluster" "main" {
  cluster_identifier      = "sentinela-cluster"
  engine                  = "aurora-postgresql"
  engine_version          = "15.4"
  database_name           = "sentinela"
  master_username         = var.db_username
  master_password         = var.db_password

  serverlessv2_scaling_configuration {
    min_capacity = 2
    max_capacity = 64
  }
}
```

## Scaling Thresholds

| Metric       | Scale Up        | Scale Down       |
| ------------ | --------------- | ---------------- |
| CPU          | > 70% for 2 min | < 30% for 10 min |
| Memory       | > 80% for 2 min | < 40% for 10 min |
| Request Rate | > 1000 rps      | < 200 rps        |
| Queue Depth  | > 1000          | < 100            |

## Capacity Planning

### User Growth Projections

| Users | API Pods | DB vCPUs | Redis  | Storage |
| ----- | -------- | -------- | ------ | ------- |
| 1K    | 3        | 4        | 2 GB   | 100 GB  |
| 10K   | 6        | 8        | 8 GB   | 500 GB  |
| 100K  | 20       | 32       | 32 GB  | 2 TB    |
| 1M    | 50       | 128      | 128 GB | 10 TB   |

### Load Testing

```bash
# Run load test
k6 run scripts/load-test.js --vus 1000 --duration 30m

# Stress test
k6 run scripts/stress-test.js --vus 5000 --duration 10m
```

## Related Documentation

- [PERFORMANCE.md](./PERFORMANCE.md)
- [LOAD_TESTING.md](./LOAD_TESTING.md)
- [KUBERNETES.md](./KUBERNETES.md)
