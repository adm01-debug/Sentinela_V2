#!/bin/bash
# Dependency Update Script for Sentinela
# Run this script to update all dependencies

echo "🔄 Updating dependencies..."

# Update main dependencies
npm update

# Update Radix UI components
npm install @radix-ui/react-dialog@latest @radix-ui/react-switch@latest @radix-ui/react-navigation-menu@latest

# Update testing libraries
npm install -D @vitest/ui@latest vitest@latest

# Update UI libraries
npm install sonner@latest recharts@latest

# Update React
npm install react@latest react-dom@latest @types/react@latest @types/react-dom@latest

# Update Tailwind
npm install -D tailwindcss@latest postcss@latest autoprefixer@latest

echo "✅ Dependencies updated!"
echo "Run 'npm test' to verify everything works."
