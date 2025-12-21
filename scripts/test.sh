#!/bin/bash
set -e
echo "Running tests..."
npm run test:run
npm run test:e2e
echo "All tests passed!"
