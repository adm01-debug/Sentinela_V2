#!/bin/bash
set -e
docker-compose up -d --build
echo '✅ Docker containers started'