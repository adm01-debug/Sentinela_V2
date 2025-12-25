#!/bin/bash
set -e
echo "Running tests..."
npm run test:unit
npm run test:integration
npm run test:e2e
echo "All tests passed!"
