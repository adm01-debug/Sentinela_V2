#!/bin/bash
set -e
echo 'Installing dependencies...'
npm ci
cd desktop-agent && npm ci
cd ../mobile-app && npm ci
echo '✅ All dependencies installed'