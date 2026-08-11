#!/bin/bash
echo "📦 Analyzing bundle size..."
npm run build -- --analyze
echo "✅ Bundle analysis complete"
