#!/bin/bash
set -e
echo 'Scanning for secrets...'
npx gitleaks detect --source . --verbose
echo '✅ Secret scan completed'