# Sentinela Development Guide

## Prerequisites

Before starting development, ensure you have the following installed:

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0 or **bun** >= 1.0.0
- **Git** >= 2.30.0

## Quick Start

1. **Clone the repository**

   ```bash
   git clone https://github.com/adm01-debug/sentinela.git
   cd sentinela
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   bun install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your configuration:

   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_API_URL=http://localhost:3000
   ```

4. **Start development server**

   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`

## Project Structure

```
sentinela/
├── .github/           # GitHub workflows
├── .husky/            # Git hooks
├── .storybook/        # Storybook configuration
├── docs/              # Documentation
├── e2e/               # End-to-end tests
├── public/            # Static assets
├── src/
│   ├── components/    # UI components
│   ├── hooks/         # Custom React hooks
│   ├── i18n/          # Internationalization
│   ├── lib/           # Utility libraries
│   ├── pages/         # Page components
│   ├── services/      # API services
│   ├── stores/        # State management
│   ├── styles/        # Global styles
│   ├── types/         # TypeScript types
│   └── utils/         # Utility functions
├── supabase/
│   ├── functions/     # Edge functions
│   └── migrations/    # Database migrations
└── package.json
```

## Available Scripts

| Command                   | Description               |
| ------------------------- | ------------------------- |
| `npm run dev`             | Start development server  |
| `npm run build`           | Build for production      |
| `npm run preview`         | Preview production build  |
| `npm run lint`            | Run ESLint                |
| `npm run lint:fix`        | Fix ESLint errors         |
| `npm run format`          | Format code with Prettier |
| `npm run test`            | Run unit tests            |
| `npm run test:watch`      | Run tests in watch mode   |
| `npm run test:coverage`   | Run tests with coverage   |
| `npm run test:e2e`        | Run E2E tests             |
| `npm run storybook`       | Start Storybook           |
| `npm run build-storybook` | Build Storybook           |

## Development Workflow

### Branch Naming

- `feature/` - New features
- `fix/` - Bug fixes
- `refactor/` - Code refactoring
- `docs/` - Documentation updates
- `test/` - Test additions/updates

### Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add user authentication
fix: resolve login redirect issue
docs: update API documentation
test: add unit tests for useAuth hook
refactor: simplify dashboard layout
```

### Code Style

- **ESLint** for linting
- **Prettier** for formatting
- **TypeScript** strict mode enabled

Pre-commit hooks automatically run lint and format checks.

## Testing

### Unit Tests

```bash
# Run all tests
npm run test

# Run specific test file
npm run test -- useAuth.test.ts

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run specific test
npm run test:e2e -- auth/login.spec.ts

# UI mode
npm run test:e2e -- --ui
```

## Building for Production

```bash
# Build the application
npm run build

# Preview the build
npm run preview
```

Build output will be in the `dist/` directory.

## Supabase Development

### Local Development

```bash
# Start Supabase locally
npx supabase start

# Stop Supabase
npx supabase stop
```

### Edge Functions

```bash
# Serve functions locally
npx supabase functions serve

# Deploy a function
npx supabase functions deploy function-name
```

### Migrations

```bash
# Create new migration
npx supabase migration new migration_name

# Apply migrations
npx supabase db push
```

## Troubleshooting

### Common Issues

**Port already in use**

```bash
# Find and kill process on port 5173
lsof -i :5173
kill -9 <PID>
```

**Node modules issues**

```bash
rm -rf node_modules
rm package-lock.json
npm install
```

**TypeScript errors after update**

```bash
npm run typecheck
```

## Resources

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase Documentation](https://supabase.com/docs)
- [Playwright Documentation](https://playwright.dev/)
- [Vitest Documentation](https://vitest.dev/)
