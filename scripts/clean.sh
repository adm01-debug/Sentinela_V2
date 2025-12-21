#!/bin/bash
set -e
echo "Cleaning..."
rm -rf node_modules dist coverage .cache
rm -rf desktop-agent/node_modules desktop-agent/dist
rm -rf mobile-app/node_modules
echo "Clean completed!"
