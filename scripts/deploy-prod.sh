#!/bin/bash
set -e
echo 'Deploying to production...'
npm run build
# Add your deployment commands here
echo '✅ Deployed to production'