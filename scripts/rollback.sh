#!/bin/bash
set -e
VERSION=$1
[ -z "$VERSION" ] && echo 'Usage: rollback.sh <version>' && exit 1
git checkout $VERSION
npm ci
npm run build
echo "✅ Rolled back to $VERSION"