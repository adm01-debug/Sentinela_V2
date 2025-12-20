# Testing Guide

## Overview

This project uses a comprehensive testing strategy with multiple layers:

- **Unit Tests**: Vitest for components, hooks, and utilities
- **Integration Tests**: Testing component interactions and data flow
- **E2E Tests**: Playwright for full user journey testing

## Running Tests

### Unit Tests

```bash
# Run all unit tests
npm run test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

### E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui

# Run specific test file
npx playwright test e2e/auth.spec.ts
```

## Test Structure

```
src/
├── hooks/
│   └── __tests__/           # Hook tests
├── components/
│   └── __tests__/           # Component tests
├── lib/
│   └── __tests__/           # Utility tests
└── __tests__/
    └── integration/         # Integration tests

e2e/
├── auth.spec.ts
├── dashboard.spec.ts
├── employees.spec.ts
└── ...
```

## Writing Tests

### Hook Tests

```typescript
import { renderHook, act } from '@testing-library/react';
import { useCustomHook } from '../useCustomHook';

describe('useCustomHook', () => {
  it('should handle state changes', () => {
    const { result } = renderHook(() => useCustomHook());
    act(() => { result.current.update(); });
    expect(result.current.value).toBe(expected);
  });
});
```

### Component Tests

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Component } from '../Component';

describe('Component', () => {
  it('should render correctly', () => {
    render(<Component />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### E2E Tests

```typescript
import { test, expect } from '@playwright/test';

test('user can login', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[name="email"]', 'test@example.com');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/dashboard');
});
```

## Coverage Goals

- Hooks: 80%+
- Components: 70%+
- Utilities: 90%+
- E2E: Critical user paths

## Best Practices

1. Test behavior, not implementation
2. Use meaningful test descriptions
3. Keep tests isolated and independent
4. Mock external dependencies
5. Test edge cases and error states
