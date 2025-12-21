#!/bin/bash
set -e
echo 'Running linters...'
npm run lint
npm run typecheck
echo '✅ Linting completed'