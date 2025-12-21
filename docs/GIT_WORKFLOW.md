# Git Workflow

## Overview

This document describes the Git workflow for Sentinela.

## Branches

### Main Branches
- `main`: Production-ready code
- `develop`: Integration branch

### Feature Branches
- `feature/ISSUE-123-description`
- `fix/ISSUE-456-bug-description`
- `hotfix/critical-fix`

## Workflow

### 1. Create Branch
```bash
git checkout develop
git pull origin develop
git checkout -b feature/ISSUE-123-new-feature
```

### 2. Develop
```bash
# Make changes
git add .
git commit -m "feat: add new feature"
```

### 3. Push & PR
```bash
git push origin feature/ISSUE-123-new-feature
# Create PR on GitHub
```

### 4. Review & Merge
- Get 1+ approvals
- Pass CI checks
- Squash and merge

## Commit Messages

Follow Conventional Commits:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance

### Examples
```
feat(auth): add MFA support
fix(dashboard): resolve chart rendering issue
docs(api): update endpoint documentation
```

## Release Process

1. Merge `develop` → `main`
2. Tag with version
3. Auto-deploy to production
