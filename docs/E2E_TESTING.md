# E2E Testing Documentation

## Overview

Sentinela uses Playwright for end-to-end testing.

## Setup

```bash
# Install Playwright
npm install -D @playwright/test

# Install browsers
npx playwright install
```

## Running Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run specific test file
npx playwright test e2e/auth.spec.ts

# Run in headed mode
npx playwright test --headed

# Run with UI
npx playwright test --ui
```

## Test Structure

```
e2e/
├── auth.spec.ts          # Authentication tests
├── dashboard.spec.ts     # Dashboard tests
├── employees.spec.ts     # Employee management tests
└── violations.spec.ts    # Violation tracking tests
```

## Writing Tests

```typescript
import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Login steps
  });

  test('should display statistics', async ({ page }) => {
    await expect(page.locator('[data-testid="stats"]')).toBeVisible();
  });
});
```

## Configuration

```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  retries: 2,
  use: {
    baseURL: 'http://localhost:5173',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
});
```

## Best Practices

1. Use data-testid attributes for selectors
2. Implement page object pattern
3. Handle flaky tests with retries
4. Use visual regression testing
