#!/bin/bash
set -e
cd desktop-agent
npm ci
npm run build
echo '✅ Desktop agent built'