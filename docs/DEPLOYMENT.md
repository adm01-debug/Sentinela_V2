# Sentinela Deployment Guide

## Prerequisites

- Node.js 18+ 
- Docker (optional)
- Supabase account
- Mapbox account (for maps)

## Quick Start

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

Create `.env` file:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_MAPBOX_TOKEN=pk.eyJ1IjoieW91ci11c2VyIiwiYSI6...
```

### 4. Start Development Server

```bash
npm run dev
```

Access at `http://localhost:5173`

---

## Production Deployment

### Option 1: Docker

```bash
# Build image
docker build -t sentinela:latest .

# Run container
docker run -d -p 80:80 sentinela:latest
```

### Option 2: Docker Compose

```bash
docker-compose up -d
```

### Option 3: Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Option 4: Netlify

```bash
# Build
npm run build

# Deploy dist/ folder to Netlify
```

---

## Supabase Setup

### 1. Create Project

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Note the URL and anon key

### 2. Run Migrations

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref <your-project-ref>

# Run migrations
supabase db push
```

### 3. Deploy Edge Functions

```bash
# Deploy all functions
supabase functions deploy

# Or deploy specific function
supabase functions deploy agent-collector
```

### 4. Configure Secrets

```bash
supabase secrets set FCM_SERVER_KEY=your-fcm-key
supabase secrets set MAPBOX_PUBLIC_TOKEN=pk.xxx
```

---

## Database Setup

### Initial Schema

Run the SQL migrations in order:

```bash
supabase db reset
```

Or manually via Supabase Dashboard > SQL Editor.

### Enable Row Level Security

```sql
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_violations ENABLE ROW LEVEL SECURITY;
-- ... for all tables
```

---

## CI/CD Pipeline

### GitHub Actions

The project includes `.github/workflows/test.yml` for:

1. **On Push/PR**: 
   - Lint code
   - Type check
   - Run tests
   - Build project

2. **On Release**:
   - Build Docker image
   - Push to registry
   - Deploy to production

### Setup Secrets

In GitHub repo settings, add:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DOCKER_USERNAME`
- `DOCKER_PASSWORD`

---

## Monitoring

### Sentry (Error Tracking)

```typescript
// Already configured in src/lib/sentry.ts
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
});
```

### Health Checks

- Frontend: `GET /health` (via nginx)
- Backend: `GET /functions/v1/health`

---

## SSL/TLS

### Let\'s Encrypt (Docker)

```bash
# Using certbot
certbot certonly --webroot -w /var/www/html -d your-domain.com
```

### Cloudflare

1. Add site to Cloudflare
2. Enable "Full (strict)" SSL
3. Update DNS to Cloudflare nameservers

---

## Scaling

### Horizontal Scaling

```yaml
# docker-compose.yml
services:
  app:
    deploy:
      replicas: 3
```

### Load Balancer

Use nginx or cloud load balancer for multiple instances.

---

## Backup & Recovery

### Database Backup

```bash
# Supabase handles automatic backups
# For manual backup:
pg_dump $DATABASE_URL > backup.sql
```

### Restore

```bash
psql $DATABASE_URL < backup.sql
```

---

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check Supabase Edge Function CORS headers
   - Verify allowed origins

2. **Auth Issues**
   - Verify JWT token
   - Check RLS policies

3. **Build Failures**
   - Clear `node_modules` and reinstall
   - Check Node.js version

### Logs

```bash
# Supabase logs
supabase functions logs agent-collector

# Docker logs
docker-compose logs -f app
```
