# Testing Guide
## Running Tests
```bash
npm test
npm run test:coverage
npm run test:watch
```
## Test Structure
- `tests/core/` - Core utilities
- `tests/integration/` - Integration tests
- `tests/e2e/` - End-to-end tests
## Writing Tests
Use Jest with TypeScript. Each module should have corresponding test file.
