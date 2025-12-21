#!/bin/bash
set -e
echo 'Running security audit...'
npm audit
npx snyk test
echo '✅ Security audit completed'