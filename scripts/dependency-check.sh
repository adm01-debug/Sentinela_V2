#!/bin/bash
set -e
echo 'Checking dependencies...'
npm audit
npm outdated || true
echo '✅ Dependency check completed'