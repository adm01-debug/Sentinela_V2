#!/bin/bash
set -e
echo "🎨 Generating icons..."
npx sharp-cli resize public/icon.png -w 16 -o public/favicon-16.png
npx sharp-cli resize public/icon.png -w 32 -o public/favicon-32.png
npx sharp-cli resize public/icon.png -w 192 -o public/icon-192.png
npx sharp-cli resize public/icon.png -w 512 -o public/icon-512.png
echo "✅ Icons generated!"
