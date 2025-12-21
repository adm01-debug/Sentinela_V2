#!/bin/bash
set -e
echo 'Profiling application...'
npm run build -- --profile
echo '✅ Profiling completed'