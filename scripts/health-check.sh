#!/bin/bash
set -e

echo "Running health checks..."

# Check API
API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health)
if [ "$API_STATUS" = "200" ]; then
  echo "✅ API: Healthy"
else
  echo "❌ API: Unhealthy (Status: $API_STATUS)"
  exit 1
fi

# Check database
if npm run db:check > /dev/null 2>&1; then
  echo "✅ Database: Connected"
else
  echo "❌ Database: Not connected"
  exit 1
fi

# Check Redis
if redis-cli ping > /dev/null 2>&1; then
  echo "✅ Redis: Connected"
else
  echo "❌ Redis: Not connected"
  exit 1
fi

echo ""
echo "All health checks passed!"
