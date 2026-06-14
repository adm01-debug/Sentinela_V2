#!/bin/bash
set -euo pipefail
MAX_SIZE=512000 # 500KB for the main (entry) bundle js
npm run build

# Measure the main application entry chunk, not the sum of every vendor chunk.
# Vite emits the entry as dist/assets/index-<hash>.js. Vendor/lazy chunks are
# code-split and loaded on demand, so they are intentionally excluded here.
SIZE=$(du -cb dist/assets/index-*.js | awk '/total$/ {print $1}')
echo "Main JS bundle size: ${SIZE} bytes (limit ${MAX_SIZE})"
if [ "$SIZE" -gt "$MAX_SIZE" ]; then
  echo "Error: Main bundle size exceeds limit of $MAX_SIZE bytes"
  exit 1
fi
echo "Bundle size check passed!"
