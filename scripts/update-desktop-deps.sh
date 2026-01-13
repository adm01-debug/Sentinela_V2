#!/bin/bash
# Desktop Agent Dependency Update Script

cd desktop-agent

echo "🔄 Updating desktop agent dependencies..."

npm install electron@latest electron-store@latest
npm install node-fetch@latest
npm install uuid@latest @types/uuid@latest

echo "✅ Desktop agent dependencies updated!"
