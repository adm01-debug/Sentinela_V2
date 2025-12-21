#!/bin/bash
set -e
echo 'Generating changelog...'
npx conventional-changelog -p angular -i CHANGELOG.md -s
echo '✅ Changelog generated'