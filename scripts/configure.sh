#!/bin/bash
set -e
cp .env.example .env
echo 'Please edit .env with your settings'
npm run db:migrate
echo '✅ Configuration completed'