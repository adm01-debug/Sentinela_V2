#!/bin/bash
set -e
echo "Building Sentinela..."
npm ci
npm run typecheck
npm run lint
npm run test:run
npm run build
echo "Build completed!"
