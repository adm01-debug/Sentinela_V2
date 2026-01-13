#!/bin/bash
echo "🐳 Starting Docker development environment..."
docker-compose -f docker-compose.dev.yml up -d
echo "✅ Development environment ready"
