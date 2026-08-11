#!/bin/bash
# Pre-commit hook script
# Runs linting, type checking, and tests before commit

set -e

echo "🔍 Running pre-commit checks..."

# Lint staged files
echo "📝 Linting..."
npx lint-staged

# Type check
echo "🔧 Type checking..."
npx tsc --noEmit

# Run affected tests
echo "🧪 Running tests..."
npm run test:changed

echo "✅ All pre-commit checks passed!"
