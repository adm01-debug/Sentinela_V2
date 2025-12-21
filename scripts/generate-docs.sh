#!/bin/bash
set -e
echo 'Generating documentation...'
npx typedoc --out docs/api src/
echo '✅ Documentation generated'