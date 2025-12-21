#!/bin/bash
set -e
echo 'Signing desktop app...'
cd desktop-agent
electron-builder --sign
echo '✅ Desktop app signed'