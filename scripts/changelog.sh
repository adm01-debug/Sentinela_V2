#!/bin/bash
set -e

VERSION=${1:-"patch"}

echo "🏷️  Generating changelog..."

# Get latest tag
LATEST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "")

if [ -z "$LATEST_TAG" ]; then
  echo "No previous tags found. Creating initial changelog."
  COMMITS=$(git log --pretty=format:"- %s (%h)" --no-merges)
else
  echo "Generating changelog since $LATEST_TAG"
  COMMITS=$(git log $LATEST_TAG..HEAD --pretty=format:"- %s (%h)" --no-merges)
fi

# Categorize commits
FEATURES=$(echo "$COMMITS" | grep -E "^- (feat|feature)" || true)
FIXES=$(echo "$COMMITS" | grep -E "^- (fix|bugfix)" || true)
DOCS=$(echo "$COMMITS" | grep -E "^- (doc|docs)" || true)
OTHERS=$(echo "$COMMITS" | grep -vE "^- (feat|feature|fix|bugfix|doc|docs)" || true)

# Generate changelog entry
DATE=$(date +%Y-%m-%d)
NEW_VERSION=$(npm version $VERSION --no-git-tag-version | tr -d 'v')

CHANGELOG_ENTRY="## [$NEW_VERSION] - $DATE

"

if [ -n "$FEATURES" ]; then
  CHANGELOG_ENTRY+="### ✨ Features
$FEATURES

"
fi

if [ -n "$FIXES" ]; then
  CHANGELOG_ENTRY+="### 🐛 Fixes
$FIXES

"
fi

if [ -n "$DOCS" ]; then
  CHANGELOG_ENTRY+="### 📚 Documentation
$DOCS

"
fi

if [ -n "$OTHERS" ]; then
  CHANGELOG_ENTRY+="### 🔧 Other Changes
$OTHERS

"
fi

# Prepend to CHANGELOG.md
if [ -f "CHANGELOG.md" ]; then
  echo -e "$CHANGELOG_ENTRY$(cat CHANGELOG.md)" > CHANGELOG.md
else
  echo -e "# Changelog

$CHANGELOG_ENTRY" > CHANGELOG.md
fi

echo "✅ Changelog updated for version $NEW_VERSION"
