#!/bin/bash
set -e
echo "🐳 Building Docker images..."
docker build -t sentinela-web .
docker build -t sentinela-agent ./desktop-agent
echo "✅ Docker build complete!"
