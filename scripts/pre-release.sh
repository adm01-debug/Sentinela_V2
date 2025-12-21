#!/bin/bash
set -e
echo "📦 Pre-release checks..."
npm run lint
npm run typecheck
npm run test
npm run build
echo "✅ Pre-release checks passed!"
