#!/bin/bash
set -e
echo 'Initializing project...'
npm ci
cp .env.example .env
npm run db:migrate
npm run db:seed
echo '✅ Project initialized'