#!/bin/bash
set -e
echo 'Setting up development environment...'
npm install
cp .env.example .env.local
echo 'Setup complete!'