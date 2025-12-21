#!/bin/bash
set -e
TAG=${1:-latest}
echo "🐳 Pushing Docker images..."
docker push sentinela-web:$TAG
docker push sentinela-agent:$TAG
echo "✅ Docker push complete!"
