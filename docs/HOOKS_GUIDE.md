# Hooks Guide

Comprehensive guide to custom hooks in Sentinela.

## Data Hooks

### useDebounce

Debounce rapidly changing values.

```typescript
const debouncedSearch = useDebounce(searchTerm, 300);
```

### usePagination

Handle pagination state.

```typescript
const { page, pageSize, offset, setPage } = usePagination({ total: 100 });
```

## UI Hooks

### useMediaQuery

Responsive design queries.

```typescript
const isMobile = useMediaQuery("(max-width: 768px)");
```

### useToggle

Boolean state management.

```typescript
const [isOpen, toggle, setIsOpen] = useToggle(false);
```

### useCopyToClipboard

Clipboard operations.

```typescript
const [copied, copy] = useCopyToClipboard();
```

## Lifecycle Hooks

### usePrevious

Track previous values.

```typescript
const prevCount = usePrevious(count);
```

### useIntersectionObserver

Detect element visibility.

```typescript
const { ref, isVisible } = useIntersectionObserver();
```

## State Hooks

### useLocalStorage

Persisted state.

```typescript
const [theme, setTheme] = useLocalStorage("theme", "light");
```
