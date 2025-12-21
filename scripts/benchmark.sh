#!/bin/bash
set -e
echo "⚡ Running benchmarks..."
npm run build
npx lighthouse http://localhost:3000 --output=json --output-path=./benchmark.json
echo "✅ Benchmark complete! Results in benchmark.json"
