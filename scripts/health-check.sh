#!/bin/bash
echo "🏥 Running health checks..."
curl -sf http://localhost:3000/health || echo "❌ Web server not healthy"
curl -sf http://localhost:54321/health || echo "❌ Supabase not healthy"
echo "✅ Health check complete!"
