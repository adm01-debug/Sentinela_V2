#!/bin/bash
set -e
echo "🔧 Fixing lint issues..."
npx eslint --fix "src/**/*.{ts,tsx}"
npx prettier --write "src/**/*.{ts,tsx,json,css,md}"
echo "✅ Lint fix complete!"
