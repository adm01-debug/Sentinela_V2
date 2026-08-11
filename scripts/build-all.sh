#!/bin/bash
echo "🏗️ Building all targets..."
npm run build
npm run build:storybook
echo "✅ All builds complete"
