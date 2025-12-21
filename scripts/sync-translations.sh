#!/bin/bash
set -e
echo 'Syncing translations...'
npx i18next-scanner
echo '✅ Translations synced'