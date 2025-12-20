# Hooks Documentation

## Page Hooks

### useTeamsPage

Manages teams page state and operations.

```tsx
const {
  teams,
  stats,
  isLoading,
  handleOpenCreate,
  handleOpenEdit,
  handleDelete,
} = useTeamsPage();
```

### useViolationsPage

Manages violations with filtering.

```tsx
const {
  violations,
  severityFilter,
  setSeverityFilter,
  statusFilter,
  setStatusFilter,
  handleResolve,
} = useViolationsPage();
```

### useMonitoringPoliciesPage

Manages monitoring policies CRUD.

```tsx
const {
  policies,
  formData,
  setFormData,
  handleSubmit,
} = useMonitoringPoliciesPage();
```

## Utility Hooks

### useDebounce

Debounce a value.

```tsx
const debouncedSearch = useDebounce(search, 300);
```

### useToggle

Boolean toggle state.

```tsx
const [isOpen, toggle, setIsOpen] = useToggle(false);
```

### useClipboard

Copy to clipboard with status.

```tsx
const { copy, copied, error } = useClipboard();
await copy('text');
```

### useInterval

Set up an interval.

```tsx
useInterval(() => {
  refetch();
}, isAutoRefresh ? 30000 : null);
```

### usePrevious

Get previous value.

```tsx
const prevCount = usePrevious(count);
```

### useDocumentTitle

Set document title.

```tsx
useDocumentTitle('Dashboard | Sentinela');
```

### useKeyboardShortcut

Listen for keyboard shortcuts.

```tsx
useKeyboardShortcut('k', handleSearch, { ctrlKey: true });
```

### useOnlineStatus

Track online/offline status.

```tsx
const isOnline = useOnlineStatus();
```
