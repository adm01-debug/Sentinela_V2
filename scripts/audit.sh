#!/bin/bash
set -e
echo "🔒 Running security audit..."
npm audit
echo "📦 Checking dependencies..."
npx depcheck
echo "✅ Audit complete!"
