#!/bin/bash
set -e
echo "Starting development..."
[ ! -f .env ] && cp .env.example .env
[ ! -d "node_modules" ] && npm install
npm run dev
