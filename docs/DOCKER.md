# Docker Deployment Guide
## Quick Start
```bash
docker-compose up -d
```
## docker-compose.yml
```yaml
version: '3.8'
services:
  app:
    build: .
    ports: ["3000:3000"]
    env_file: .env
  db:
    image: postgres:14
    volumes: ["pgdata:/var/lib/postgresql/data"]
  redis:
    image: redis:6-alpine
volumes:
  pgdata:
```
## Building
```bash
docker build -t sentinela:latest .
```
## Environment Variables
Pass via `-e` or `--env-file`.
