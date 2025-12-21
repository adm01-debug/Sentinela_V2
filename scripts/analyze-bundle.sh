#!/bin/bash
set -e
echo "Analyzing bundle..."
npm run build -- --stats
npx vite-bundle-visualizer
echo "Analysis complete! Check stats.html"
