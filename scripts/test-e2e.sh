#!/bin/bash
set -e
echo 'Running E2E tests...'
npx playwright test
echo '✅ E2E tests completed'