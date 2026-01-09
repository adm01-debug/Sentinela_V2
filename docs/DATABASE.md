# Database Schema

## Core Tables

### employees
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| name | text | Employee name |
| email | text | Email address |
| department | text | Department |
| team_id | uuid | Team reference |
| created_at | timestamp | Creation date |

### violations
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| employee_id | uuid | Employee reference |
| type | text | Violation type |
| severity | text | low/medium/high/critical |
| created_at | timestamp | When occurred |

### activities
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| employee_id | uuid | Employee reference |
| type | text | Activity type |
| metadata | jsonb | Activity details |
| created_at | timestamp | When occurred |

## Migrations

Run migrations:
```bash
npx supabase db push
```

View migrations in `supabase/migrations/`
