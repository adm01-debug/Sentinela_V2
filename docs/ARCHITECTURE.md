# Sentinela Architecture

## Overview

Sentinela is a comprehensive employee monitoring and security platform built with modern web technologies.

## Tech Stack

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
├─────────────────────────────────────────────────────────────────┤
│  React 18 + TypeScript + Vite                                   │
│  ├── UI: shadcn/ui + Tailwind CSS                              │
│  ├── State: TanStack Query + Zustand                           │
│  ├── Routing: React Router v6                                  │
│  ├── Forms: React Hook Form + Zod                              │
│  ├── Charts: Recharts                                          │
│  ├── Maps: Mapbox GL                                           │
│  └── i18n: react-i18next                                       │
├─────────────────────────────────────────────────────────────────┤
│                         BACKEND                                  │
├─────────────────────────────────────────────────────────────────┤
│  Supabase                                                       │
│  ├── PostgreSQL Database                                        │
│  ├── Edge Functions (Deno)                                      │
│  ├── Realtime Subscriptions                                     │
│  ├── Row Level Security (RLS)                                   │
│  ├── Storage (for screenshots)                                  │
│  └── Auth (JWT + MFA)                                          │
├─────────────────────────────────────────────────────────────────┤
│                      INFRASTRUCTURE                              │
├─────────────────────────────────────────────────────────────────┤
│  ├── Docker + nginx                                             │
│  ├── GitHub Actions (CI/CD)                                     │
│  └── Vercel/Netlify (optional)                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Project Structure

```
sentinela/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── ui/              # shadcn/ui primitives
│   │   ├── employees/       # Employee-related components
│   │   ├── schedules/       # Schedule components
│   │   ├── webhooks/        # Webhook components
│   │   └── ...
│   ├── hooks/               # Custom React hooks
│   │   ├── useEmployees.ts
│   │   ├── useEmployeesPage.ts  # Page-level state
│   │   └── ...
│   ├── pages/               # Route pages
│   ├── lib/                 # Utilities and helpers
│   │   ├── utils.ts         # 60+ utility functions
│   │   ├── supabase.ts      # Supabase client
│   │   └── ...
│   ├── locales/             # i18n translations
│   └── types/               # TypeScript types
├── supabase/
│   ├── functions/           # Edge Functions
│   │   ├── _shared/         # Shared utilities
│   │   ├── agent-collector/
│   │   ├── mobile-collector/
│   │   └── ...
│   └── migrations/          # Database migrations
├── e2e/                     # Playwright E2E tests
├── docs/                    # Documentation
└── ...config files
```

## Data Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Desktop    │     │    Mobile    │     │   Browser    │
│    Agent     │     │     App      │     │   (React)    │
└──────┬───────┘     └──────┬───────┘     └──────┬───────┘
       │                    │                    │
       ▼                    ▼                    ▼
┌──────────────────────────────────────────────────────────┐
│                    Edge Functions                         │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐         │
│  │  agent-    │  │  mobile-   │  │   REST     │         │
│  │ collector  │  │ collector  │  │   APIs     │         │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘         │
│        │               │               │                 │
│        └───────────────┼───────────────┘                 │
│                        ▼                                 │
│              ┌─────────────────┐                        │
│              │   Validation    │  (Zod schemas)         │
│              │  Rate Limiting  │                        │
│              └────────┬────────┘                        │
└───────────────────────┼──────────────────────────────────┘
                        ▼
┌──────────────────────────────────────────────────────────┐
│                    Supabase                               │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐         │
│  │ PostgreSQL │  │  Realtime  │  │  Storage   │         │
│  │    + RLS   │  │   PubSub   │  │   Bucket   │         │
│  └────────────┘  └────────────┘  └────────────┘         │
└──────────────────────────────────────────────────────────┘
```

## Database Schema

### Core Tables

```sql
-- Employees
employees (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  email text UNIQUE,
  department text,
  position text,
  team_id uuid REFERENCES teams(id),
  status text DEFAULT 'active',
  created_at timestamptz
)

-- Security Violations
security_violations (
  id uuid PRIMARY KEY,
  employee_id uuid REFERENCES employees(id),
  violation_type text NOT NULL,
  severity text NOT NULL,  -- low, medium, high, critical
  status text DEFAULT 'open',
  description text,
  created_at timestamptz,
  resolved_at timestamptz
)

-- Work Schedules
work_schedules (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  work_days integer[],  -- [1,2,3,4,5] for Mon-Fri
  start_time time,
  end_time time,
  break_start time,
  break_end time,
  flexible_start boolean,
  overtime_allowed boolean,
  block_outside_hours boolean
)

-- Geofences
geofences (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  geometry jsonb,  -- GeoJSON polygon
  radius numeric,
  is_active boolean
)
```

## Security Architecture

### Authentication Flow

```
User → Login Form → Supabase Auth → JWT Token
                                         │
                 ┌───────────────────────┘
                 ▼
         ┌───────────────┐
         │  RLS Policies │ ← Row Level Security
         └───────┬───────┘
                 │
    ┌────────────┼────────────┐
    ▼            ▼            ▼
  SELECT      UPDATE       DELETE
  (filtered)  (restricted) (admin only)
```

### Rate Limiting

All Edge Functions implement rate limiting:

| Endpoint | Limit | Window |
|----------|-------|--------|
| agent-collector | 100 | 60s |
| mobile-collector | 60 | 60s |
| send-webhook | 30 | 60s |
| health | 100 | 60s |

### Input Validation

All inputs are validated using Zod schemas before processing:

```typescript
const AgentDataSchema = z.object({
  employee_id: z.string().uuid(),
  device_id: z.string().min(1),
  data_type: z.enum(['screenshot', 'activity', ...]),
  data: z.record(z.unknown()),
});
```

## Performance Optimizations

### Frontend

1. **Code Splitting** - Lazy loading for routes
2. **Memoization** - React.memo for expensive components
3. **Virtual Lists** - For large data tables
4. **Optimistic Updates** - TanStack Query mutations

### Backend

1. **Database Indexes** - On frequently queried columns
2. **Connection Pooling** - PgBouncer via Supabase
3. **Edge Functions** - Low latency with Deno
4. **CDN** - Static assets cached globally

## Monitoring & Observability

```
┌─────────────────────────────────────────────────────────┐
│                    Observability                         │
├─────────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐   │
│  │ Sentry  │  │  Logs   │  │ Metrics │  │ Alerts  │   │
│  │ (errors)│  │(Supabase│  │(custom) │  │(webhook)│   │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘   │
└─────────────────────────────────────────────────────────┘
```

## Deployment

### Docker Deployment

```bash
# Build
docker build -t sentinela .

# Run
docker-compose up -d
```

### Environment Variables

```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_MAPBOX_TOKEN=pk.xxx
```

## Scaling Considerations

- **Horizontal Scaling**: Stateless frontend, containerized
- **Database**: Supabase handles scaling automatically
- **Edge Functions**: Auto-scaled by Supabase
- **Storage**: S3-compatible with CDN
