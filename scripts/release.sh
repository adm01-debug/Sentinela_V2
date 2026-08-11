#!/bin/bash
# Release automation script
# Usage: ./release.sh [major|minor|patch]

set -e

VERSION_TYPE=${1:-patch}

echo "📦 Creating $VERSION_TYPE release..."

# Ensure clean working directory
if [[ -n $(git status --porcelain) ]]; then
  echo "❌ Working directory not clean"
  exit 1
fi

# Pull latest
git checkout main
git pull origin main

# Bump version
npm version $VERSION_TYPE -m "chore(release): v%s"

# Build
npm run build

# Run tests
npm test

# Push with tags
git push origin main --tags

echo "✅ Release complete!"
echo "📋 Next steps:"
echo "   1. Create GitHub release"
echo "   2. Deploy to production"
