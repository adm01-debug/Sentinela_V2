#!/bin/bash
set -e
VERSION=$1
if [ -z "$VERSION" ]; then
  echo "Usage: ./release.sh <version>"
  exit 1
fi
echo "Releasing version $VERSION..."
npm version $VERSION
npm run build
npm publish
git push --tags
echo "Release complete!"
