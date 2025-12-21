#!/bin/bash
set -e
npm ci
NODE_ENV=development npm run build
echo '✅ Development build completed'