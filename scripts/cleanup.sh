#!/bin/bash
set -e
rm -rf node_modules/.cache
rm -rf dist
rm -rf .next
rm -rf coverage
npm cache clean --force
echo '✅ Cleanup completed'