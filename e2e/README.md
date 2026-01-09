# E2E Tests

This directory contains Playwright end-to-end tests.

## Structure

```
e2e/
├── auth/           # Authentication flows
├── dashboard/      # Dashboard tests
├── employees/      # Employee management
├── violations/     # Violation handling
├── reports/        # Report generation
├── settings/       # Settings tests
├── mobile/         # Mobile responsive
└── accessibility/  # A11y tests
```

## Running Tests

```bash
# Run all tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui

# Run specific test
npx playwright test auth/login.spec.ts
```
