# Installation Guide

Complete installation instructions for Sentinela.

## System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| Node.js | 18.x | 20.x LTS |
| npm | 9.x | 10.x |
| RAM | 4GB | 8GB |
| Disk | 2GB | 5GB |

## Installation Methods

### Method 1: npm (Recommended)
```bash
git clone https://github.com/adm01-debug/sentinela.git
cd sentinela
npm install
```

### Method 2: Docker
```bash
docker-compose up -d
```

### Method 3: Manual Build
```bash
npm run build
npm run preview
```

## Database Setup

### Supabase (Cloud)
1. Create project at supabase.com
2. Copy project URL and anon key
3. Run migrations: `npm run db:migrate`

### Self-hosted PostgreSQL
```bash
psql -U postgres -f supabase/migrations/*.sql
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| VITE_SUPABASE_URL | Supabase project URL | Yes |
| VITE_SUPABASE_ANON_KEY | Supabase anon key | Yes |
| VITE_APP_NAME | Application name | No |

## Verification
```bash
npm run test
npm run build
```

## Troubleshooting

### Common Issues
- Port 5173 in use: `lsof -i :5173`
- Node version: `nvm use 20`
- Clear cache: `rm -rf node_modules && npm install`
