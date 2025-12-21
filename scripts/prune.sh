#!/bin/bash
set -e
echo 'Pruning unused dependencies...'
npm prune
docker system prune -f
echo '✅ Pruning completed'