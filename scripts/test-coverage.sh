#!/bin/bash
set -e
echo 'Running tests with coverage...'
npm run test -- --coverage
echo '✅ Coverage report generated'