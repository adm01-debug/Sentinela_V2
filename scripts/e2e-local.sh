#!/bin/bash
set -e
echo "🎭 Running E2E tests locally..."
npm run dev &
sleep 5
npx playwright test
kill %1
echo "✅ E2E tests complete!"
