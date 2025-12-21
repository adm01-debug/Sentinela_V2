#!/bin/bash
set -e
echo "✅ Validating configuration..."
[ -f .env ] || { echo "❌ .env file missing"; exit 1; }
[ -f package.json ] || { echo "❌ package.json missing"; exit 1; }
echo "✅ Configuration valid!"
