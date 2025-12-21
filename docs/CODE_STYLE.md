# Code Style Guide

## Overview

This document defines the coding standards for Sentinela.

## TypeScript

### Naming Conventions
- **Components**: PascalCase (`UserAvatar.tsx`)
- **Hooks**: camelCase with `use` prefix (`useAuth.ts`)
- **Utils**: camelCase (`formatDate.ts`)
- **Types**: PascalCase (`Employee.ts`)
- **Constants**: UPPER_SNAKE_CASE

### File Structure
```typescript
// 1. Imports (external, internal, types)
import React from 'react';
import { Button } from '@/components/ui/button';
import type { Employee } from '@/types';

// 2. Types/Interfaces
interface Props {
  employee: Employee;
  onSelect: (id: string) => void;
}

// 3. Component
export function EmployeeCard({ employee, onSelect }: Props) {
  // 4. Hooks
  const { data } = useQuery(...);
  
  // 5. Handlers
  const handleClick = () => onSelect(employee.id);
  
  // 6. Render
  return <div>...</div>;
}
```

## React Best Practices

- Prefer functional components
- Use custom hooks for logic reuse
- Memoize expensive computations
- Keep components small and focused

## CSS/Tailwind

- Use Tailwind utility classes
- Extract common patterns to components
- Follow mobile-first approach
- Use CSS variables for theming

## Testing

- Test behavior, not implementation
- Use meaningful test descriptions
- Mock external dependencies
- Aim for 80%+ coverage
