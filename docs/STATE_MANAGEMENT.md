# State Management

## Overview

Sentinela uses a combination of state management solutions.

## Server State

### React Query
```typescript
const { data, isLoading } = useQuery({
  queryKey: ['employees'],
  queryFn: fetchEmployees,
});
```

## Client State

### Zustand
```typescript
const useStore = create((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}));
```

## Form State

### React Hook Form
```typescript
const { register, handleSubmit } = useForm();
```

## URL State

### React Router
```typescript
const [searchParams, setSearchParams] = useSearchParams();
```

## Persistence

### LocalStorage
```typescript
const [value, setValue] = useLocalStorage('key', defaultValue);
```

## Best Practices

- Colocate state with usage
- Avoid prop drilling
- Use appropriate solution
- Keep state minimal
