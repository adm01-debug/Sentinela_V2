# Deployment Guide

## Prerequisites
- Docker & Docker Compose
- AWS CLI configured
- kubectl configured (for K8s)

## Docker Deployment

### Build Images
```bash
docker build -t sentinela-web .
docker build -t sentinela-api ./api
```

### Run with Docker Compose
```bash
docker-compose up -d
```

### Environment Variables
```env
DATABASE_URL=postgresql://user:pass@db:5432/sentinela
REDIS_URL=redis://redis:6379
JWT_SECRET=your-secret-key
```

## AWS Deployment

### ECS with Fargate
```bash
cd terraform
terraform init
terraform plan
terraform apply
```

### S3 + CloudFront (Frontend)
```bash
aws s3 sync dist/ s3://sentinela-web
aws cloudfront create-invalidation --distribution-id XXX --paths "/*"
```

## Kubernetes Deployment

### Apply Manifests
```bash
kubectl apply -f k8s/
```

### Verify Deployment
```bash
kubectl get pods -n sentinela
kubectl get services -n sentinela
```

### Scaling
```bash
kubectl scale deployment sentinela-web --replicas=5
```

## Monitoring

### Prometheus
Access at: http://prometheus.sentinela.com

### Grafana
Access at: http://grafana.sentinela.com
Default credentials: admin/admin