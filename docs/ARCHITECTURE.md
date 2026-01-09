# Architecture

## Overview

Sentinela follows a modern React architecture with:

- **Frontend**: React 18 + TypeScript + Vite
- **State**: Zustand + React Query
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Auth**: Supabase Auth with MFA support

## Directory Structure

```
src/
├── components/    # UI components (156+)
│   ├── ui/        # Core UI components
│   ├── dashboard/ # Dashboard widgets
│   └── ...
├── hooks/         # Custom hooks (253+)
├── pages/         # Page components (112+)
├── lib/           # Utilities and helpers
├── locales/       # i18n translations
└── design-system/ # Design tokens

supabase/
├── functions/     # Edge functions (63+)
└── migrations/    # Database migrations (54+)
```

## Data Flow

1. User interacts with UI components
2. Components use custom hooks for logic
3. Hooks use React Query for data fetching
4. Supabase handles persistence and real-time
