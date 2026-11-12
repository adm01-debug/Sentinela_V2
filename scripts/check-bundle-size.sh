#!/bin/bash
MAX_SIZE=5000000 # 5MB — baseline 3,8MB capturado em 09/11/2026 (PR #99)
npm run build
SIZE=$(du -cb dist/assets/*.js | grep total | awk '{print $1}')
echo "Total JS bundle size: $SIZE bytes"
if [ "$SIZE" -gt "$MAX_SIZE" ]; then
  echo "Error: Bundle size exceeds limit of $MAX_SIZE bytes"
  exit 1
fi
echo "Bundle size check passed!"
