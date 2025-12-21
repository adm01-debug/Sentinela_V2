#!/bin/bash
set -e
echo 'Deploying to staging...'
npm run build
# Add your deployment commands here
echo '✅ Deployed to staging'