#!/bin/bash
set -e
npm ci --production
NODE_ENV=production npm run build
echo '✅ Production build completed'