#!/bin/bash
echo "🔧 Running lint and auto-fix..."
npm run lint:fix
npm run format
echo "✅ Lint and format complete"
