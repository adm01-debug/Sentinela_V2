#!/bin/bash
set -e
echo "🎨 Formatting code..."
npx prettier --write "src/**/*.{ts,tsx,json,css,md}"
npx eslint --fix "src/**/*.{ts,tsx}"
echo "✅ Formatting complete!"
