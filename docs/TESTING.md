# Testing Guide

Comprehensive testing documentation for Sentinela.

## Test Stack

- **Unit Tests**: Vitest
- **Component Tests**: Testing Library
- **E2E Tests**: Playwright

## Running Tests

```bash
npm run test          # Unit tests
npm run test:watch    # Watch mode
npm run test:coverage # With coverage
npm run test:e2e      # E2E tests
```

## Test Structure

```
src/
├── stores/__tests__/     # Store tests
├── utils/__tests__/      # Utility tests
├── hooks/__tests__/      # Hook tests
├── components/*/__tests__/ # Component tests
├── services/__tests__/   # Service tests
e2e/
├── auth.spec.ts          # Auth E2E
├── dashboard.spec.ts     # Dashboard E2E
├── employees.spec.ts     # Employees E2E
```

## Writing Tests

### Store Test

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { useMyStore } from '../myStore';

describe('myStore', () => {
  beforeEach(() => { useMyStore.getState().reset(); });
  
  it('should do something', () => {
    const { action } = useMyStore.getState();
    action();
    expect(useMyStore.getState().value).toBe(expected);
  });
});
```

### Component Test

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { MyComponent } from '../MyComponent';

it('should render', () => {
  render(<MyComponent />);
  expect(screen.getByText('Hello')).toBeInTheDocument();
});
```

## Coverage Goals

- Stores: 90%+
- Utils: 85%+
- Components: 80%+
- Services: 75%+
