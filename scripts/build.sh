#!/bin/bash
set -e
echo "Building Sentinela..."
npm run clean
npm run build
npm run test
echo "Build complete!"
