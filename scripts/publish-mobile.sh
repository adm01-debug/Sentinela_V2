#!/bin/bash
set -e
cd mobile-app
eas submit --platform all
echo '✅ Mobile apps submitted'