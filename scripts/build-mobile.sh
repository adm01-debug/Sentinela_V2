#!/bin/bash
set -e
cd mobile-app
npm ci
npx expo build:android
npx expo build:ios
echo '✅ Mobile builds completed'