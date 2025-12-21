# CI/CD Pipeline Documentation

## Overview

Sentinela uses GitHub Actions for continuous integration and deployment.

## Workflows

### CI (Continuous Integration)

**File:** `.github/workflows/ci.yml`

Runs on every push and pull request:
- Linting (ESLint)
- Type checking (TypeScript)
- Unit tests (Vitest)
- Build verification

### CD (Continuous Deployment)

**File:** `.github/workflows/cd.yml`

Deploys to production on main branch merge:
- Build application
- Deploy to hosting provider
- Invalidate CDN cache

### Test Workflow

**File:** `.github/workflows/test.yml`

Comprehensive testing:
- Unit tests with coverage
- E2E tests with Playwright
- Visual regression tests

### Security Workflow

**File:** `.github/workflows/security.yml`

Security scanning:
- Dependency audit
- CodeQL analysis
- Secret scanning

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `SUPABASE_URL` | Supabase project URL | Yes |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `VITE_API_URL` | API base URL | Yes |

## Deployment Environments

- **Development:** Feature branches
- **Staging:** `develop` branch
- **Production:** `main` branch

## Rollback Procedure

1. Identify the last stable commit
2. Create a revert commit or rollback tag
3. Trigger deployment workflow manually
