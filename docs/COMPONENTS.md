# Components Documentation

## UI Components

### StatCard

Display statistics in a card format.

```tsx
import { StatCard } from '@/components/ui/StatCard';
import { Users } from 'lucide-react';

<StatCard
  title="Total Users"
  value={150}
  subtitle="Active users"
  icon={Users}
  iconColor="text-blue-500"
  trend={{ value: 15, isPositive: true }}
/>
```

### FilterBar

Standardized filter bar with search and dropdowns.

```tsx
import { FilterBar } from '@/components/ui/FilterBar';

<FilterBar
  searchValue={search}
  onSearchChange={setSearch}
  searchPlaceholder="Search..."
  filters={[
    {
      key: 'status',
      placeholder: 'Status',
      options: [
        { value: 'all', label: 'All' },
        { value: 'active', label: 'Active' },
      ],
      value: statusFilter,
      onChange: setStatusFilter,
    },
  ]}
  showClear
  onClearFilters={handleClear}
/>
```

### EmptyState

Display when no data is available.

```tsx
import { EmptyState } from '@/components/ui/EmptyState';
import { FileText } from 'lucide-react';

<EmptyState
  icon={FileText}
  title="No data found"
  description="Try adjusting your filters"
  action={<Button>Create New</Button>}
/>
```

### LoadingSpinner

Loading indicator with optional text.

```tsx
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

<LoadingSpinner size="lg" text="Loading data..." />
```

### IconButton

Button with icon and optional tooltip.

```tsx
import { IconButton } from '@/components/ui/IconButton';
import { Edit } from 'lucide-react';

<IconButton
  icon={Edit}
  tooltip="Edit item"
  onClick={handleEdit}
/>
```

### ConfirmButton

Button with confirmation dialog.

```tsx
import { ConfirmButton } from '@/components/ui/ConfirmButton';

<ConfirmButton
  onConfirm={handleDelete}
  title="Delete Item"
  description="Are you sure?"
  variant="destructive"
>
  Delete
</ConfirmButton>
```

## Page Components

Each major page follows a consistent pattern:

1. **Hook**: `useXPage.ts` - Contains all state, queries, mutations
2. **Components**: Extracted reusable pieces
3. **Page**: Thin wrapper composing hook + components

Example structure:
```
src/
├── hooks/
│   └── useTeamsPage.ts
├── components/
│   └── teams/
│       ├── TeamCard.tsx
│       ├── TeamStatsCards.tsx
│       └── index.ts
└── pages/
    └── Teams.tsx
```
