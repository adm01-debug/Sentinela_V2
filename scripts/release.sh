#!/bin/bash
set -e
VERSION=${1:-patch}
echo "Releasing: $VERSION"
npm run test:run
npm run build
npm version $VERSION
git push origin main --tags
echo "Released!"
