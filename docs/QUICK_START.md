# Quick Start Guide

## Prerequisites
- Node.js 20+
- PostgreSQL 15+
- Redis 7+

## Installation

### 1. Clone Repository
```bash
git clone https://github.com/adm01-debug/sentinela.git
cd sentinela
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
```bash
cp .env.example .env
# Edit .env with your values
```

### 4. Database Setup
```bash
npm run db:migrate
npm run db:seed
```

### 5. Start Development
```bash
npm run dev
```

## First Steps

1. Open http://localhost:3000
2. Login with: admin@example.com / admin123
3. Explore the dashboard

## Quick Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm test` | Run tests |
| `npm run lint` | Run linter |

## Docker Setup

```bash
docker-compose up -d
```

## Next Steps
- [Configuration Guide](./CONFIGURATION.md)
- [API Reference](./API_REFERENCE.md)
- [Architecture](./ARCHITECTURE.md)
