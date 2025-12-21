#!/bin/bash
set -e
echo 'Running integration tests...'
npm run test:integration
echo '✅ Integration tests completed'