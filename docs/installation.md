# Installation Guide

## Prerequisites

- Node.js 20+
- npm or yarn
- PostgreSQL 15+
- Redis 7+

## Web Application

### Development

```bash
git clone https://github.com/adm01-debug/sentinela.git
cd sentinela
npm install
cp .env.example .env
npm run dev
```

### Production

```bash
npm run build
npm run preview
```

## Desktop Agent

1. Download from releases
2. Install on employee machines
3. Configure API endpoint
4. Login with credentials

## Mobile App

1. Install from App Store / Play Store
2. Login with admin credentials
3. Monitor employees on-the-go

## Docker Deployment

```bash
docker-compose up -d
```

## Kubernetes Deployment

```bash
kubectl apply -f k8s/
```
