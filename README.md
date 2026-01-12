# Sentinela

Enterprise Employee Monitoring & Productivity Platform

[![CI](https://github.com/adm01-debug/sentinela/actions/workflows/ci.yml/badge.svg)](https://github.com/adm01-debug/sentinela/actions/workflows/ci.yml)
[![Security](https://github.com/adm01-debug/sentinela/actions/workflows/security.yml/badge.svg)](https://github.com/adm01-debug/sentinela/actions/workflows/security.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- Real-time activity monitoring
- Screenshot capture & analysis
- Productivity analytics & reports
- Team & employee management
- Alerts & violation detection
- Role-based access control
- API & integrations
- Multi-tenant architecture

## Tech Stack

- **Frontend**: React, Next.js, TypeScript, Tailwind CSS
- **State**: Zustand, TanStack Query
- **Backend**: Supabase, PostgreSQL
- **Testing**: Vitest, Playwright, Testing Library
- **CI/CD**: GitHub Actions

## Quick Start

```bash
# Clone the repository
git clone https://github.com/adm01-debug/sentinela.git
cd sentinela

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

## Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run test         # Run unit tests
npm run test:e2e     # Run E2E tests
npm run lint         # Lint code
npm run storybook    # Component documentation
```

## Project Structure

```
src/
├── components/      # UI components
├── hooks/          # Custom hooks
├── lib/            # Utilities & libraries
├── pages/          # Page components
├── services/       # API services
├── stores/         # State management
├── types/          # TypeScript types
├── utils/          # Helper functions
└── validators/     # Input validation
```

## Documentation

- [API Documentation](./docs/API.md)
- [Contributing](./CONTRIBUTING.md)
- [Security](./SECURITY.md)
- [Changelog](./CHANGELOG.md)

## Coverage

| Category | Coverage |
|----------|----------|
| UI Components | 103% |
| Hooks | 162% |
| Utils | 100% |
| Services | 100% |
| Pages | 100% |

## License

MIT License - see [LICENSE](./LICENSE)
