# Testing Guide

## Unit Tests

### Run All Tests
```bash
npm test
```

### Run with Coverage
```bash
npm run test:coverage
```

### Run Specific File
```bash
npm test -- src/components/Button.test.tsx
```

### Watch Mode
```bash
npm run test:watch
```

## Integration Tests

### Run Integration Tests
```bash
npm run test:integration
```

## E2E Tests

### Setup Playwright
```bash
npx playwright install
```

### Run E2E Tests
```bash
npm run e2e
```

### Run with UI
```bash
npm run e2e:ui
```

### Generate Report
```bash
npx playwright show-report
```

## Testing Best Practices

### Component Tests
- Test rendering
- Test user interactions
- Test edge cases
- Mock external dependencies

### API Tests
- Test success responses
- Test error handling
- Test authentication
- Test rate limiting

### E2E Tests
- Test critical user flows
- Test authentication
- Test responsive design
- Test accessibility