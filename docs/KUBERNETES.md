# Kubernetes Deployment

## Overview

Deploy Sentinela to Kubernetes for scalable production environments.

## Prerequisites

- kubectl configured
- Helm 3.x installed
- Container registry access

## Deployment Files

```
k8s/
├── namespace.yaml
├── deployment.yaml
├── service.yaml
├── ingress.yaml
├── configmap.yaml
└── secrets.yaml
```

## Quick Deploy

```bash
# Create namespace
kubectl apply -f k8s/namespace.yaml

# Deploy application
kubectl apply -f k8s/

# Check status
kubectl get pods -n sentinela
```

## Deployment Manifest

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: sentinela-web
  namespace: sentinela
spec:
  replicas: 3
  selector:
    matchLabels:
      app: sentinela-web
  template:
    spec:
      containers:
      - name: web
        image: sentinela:latest
        ports:
        - containerPort: 80
        resources:
          limits:
            cpu: "500m"
            memory: "256Mi"
```

## Scaling

```bash
# Manual scaling
kubectl scale deployment sentinela-web --replicas=5

# Autoscaling
kubectl autoscale deployment sentinela-web \
  --min=2 --max=10 --cpu-percent=70
```

## Monitoring

```bash
# View logs
kubectl logs -f deployment/sentinela-web

# Describe pod
kubectl describe pod <pod-name>

# Port forward for debugging
kubectl port-forward svc/sentinela-web 3000:80
```

## Rollback

```bash
# View history
kubectl rollout history deployment/sentinela-web

# Rollback to previous
kubectl rollout undo deployment/sentinela-web
```
