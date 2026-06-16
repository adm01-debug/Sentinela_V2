# Detailed Installation Guide

## Production Setup
For production environments, we recommend using Docker.

### Docker Compose
```bash
docker-compose up -d
```

## Local Development
1. Clone the repository
2. Install dependencies: `bun install`
3. Setup Supabase:
   - Run migrations in `supabase/migrations`
   - Deploy edge functions: `supabase functions deploy`
4. Start development server: `bun dev`
