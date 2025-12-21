#!/bin/bash
set -e
echo "⚡ Running performance tests..."
npm run build
npx lighthouse-ci autorun
echo "✅ Performance tests complete!"
