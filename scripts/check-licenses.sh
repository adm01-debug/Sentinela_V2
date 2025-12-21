#!/bin/bash
set -e
echo "Checking licenses..."
npx license-checker --production --csv > licenses.csv
echo "License report: licenses.csv"
