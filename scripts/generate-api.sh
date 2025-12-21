#!/bin/bash
set -e
echo 'Generating API types...'
npx openapi-typescript api-spec.yaml -o src/types/api.ts
echo '✅ API types generated'