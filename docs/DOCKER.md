# Docker Documentation

## Overview

Sentinela provides Docker support for containerized deployment.

## Quick Start

```bash
# Build the image
docker build -t sentinela .

# Run the container
docker run -p 3000:80 sentinela
```

## Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

## Dockerfile

```dockerfile
# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Environment Variables

Pass environment variables at runtime:

```bash
docker run -e VITE_API_URL=https://api.example.com sentinela
```

## Multi-Stage Build

The Dockerfile uses multi-stage builds:
1. **Build stage:** Installs dependencies and builds the app
2. **Production stage:** Uses nginx to serve static files

## Health Check

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost/health"]
  interval: 30s
  timeout: 10s
  retries: 3
```

## Best Practices

- Use `.dockerignore` to exclude unnecessary files
- Pin dependency versions
- Use non-root user in production
- Implement health checks
