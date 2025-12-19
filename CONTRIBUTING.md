# Contributing to Sentinela

Thank you for your interest in contributing to Sentinela! This document provides guidelines and steps for contributing.

## Code of Conduct

Please be respectful and constructive in all interactions.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/sentinela.git`
3. Install dependencies: `npm install`
4. Create a branch: `git checkout -b feature/your-feature`

## Development Workflow

### Running the Project

```bash
# Start development server
npm run dev

# Run tests
npm run test

# Run linter
npm run lint

# Type check
npm run typecheck

# Build for production
npm run build
```

### Code Style

- Use TypeScript for all new code
- Follow the existing code style (Prettier + ESLint)
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Keep functions small and focused

### Component Guidelines

```typescript
// Use memo for components with expensive renders
import { memo } from 'react';

interface MyComponentProps {
  // Props should be typed
  title: string;
  onClick?: () => void;
}

function MyComponentComponent({ title, onClick }: MyComponentProps) {
  // Component implementation
  return <div onClick={onClick}>{title}</div>;
}

export const MyComponent = memo(MyComponentComponent);
```

### Hook Guidelines

```typescript
// Extract complex logic into custom hooks
import { useState, useCallback } from 'react';

export function useMyHook(initialValue: number) {
  const [value, setValue] = useState(initialValue);

  const increment = useCallback(() => {
    setValue(v => v + 1);
  }, []);

  return { value, increment };
}
```

### Testing

- Write tests for new features
- Ensure existing tests pass
- Use descriptive test names

```typescript
describe('MyComponent', () => {
  it('should render title', () => {
    // Test implementation
  });
});
```

## Pull Request Process

1. Update documentation if needed
2. Add tests for new features
3. Ensure all tests pass
4. Update CHANGELOG.md
5. Request review from maintainers

### PR Title Format

- `feat: Add new feature`
- `fix: Fix bug description`
- `docs: Update documentation`
- `refactor: Refactor component`
- `test: Add tests`
- `chore: Update dependencies`

## Reporting Issues

- Use the issue template
- Include reproduction steps
- Include environment details
- Attach screenshots if relevant

## Questions?

Open a discussion or reach out to the maintainers.

Thank you for contributing! 🚀
