#!/bin/bash
set -e
echo "🧪 Running all tests..."
npm run test:unit
npm run test:e2e
npm run test:coverage
echo "✅ All tests complete!"
