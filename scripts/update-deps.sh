#!/bin/bash
set -e
echo "Updating dependencies..."
npx npm-check-updates -u
npm install
npm audit fix
echo "Dependencies updated!"
