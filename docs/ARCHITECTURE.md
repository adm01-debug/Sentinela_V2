# Architecture

## Overview

Sentinela is a modern employee monitoring system built with:

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **State**: Zustand + React Query
- **UI**: Radix UI + Tailwind CSS

## Directory Structure

```
src/
├── components/     # React components
│   ├── ui/         # Base UI components
│   ├── dashboard/  # Dashboard widgets
│   ├── employees/  # Employee components
│   └── ...
├── hooks/          # Custom React hooks
├── pages/          # Page components
├── lib/            # Utilities and configs
├── locales/        # i18n translations
└── integrations/   # External integrations

supabase/
├── functions/      # Edge Functions
└── migrations/     # Database migrations
```

## Data Flow

1. User interacts with UI
2. Component calls custom hook
3. Hook uses React Query for data fetching
4. React Query calls Supabase API
5. Data is cached and returned
6. UI updates reactively

## Key Patterns

- **Hooks Pattern**: Business logic in custom hooks
- **Compound Components**: Flexible UI composition
- **Feature Folders**: Co-located feature code
- **Edge Functions**: Serverless backend logic
