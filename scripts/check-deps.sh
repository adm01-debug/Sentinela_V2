#!/bin/bash
set -e
echo "📦 Checking dependencies..."
npx depcheck
npx npm-check -u
echo "✅ Dependency check complete!"
