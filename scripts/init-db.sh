#!/bin/bash
set -e

echo "Initializing database..."

# Wait for PostgreSQL
until pg_isready -h localhost -p 5432; do
  echo "Waiting for PostgreSQL..."
  sleep 2
done

# Create database if not exists
psql -h localhost -U postgres -tc "SELECT 1 FROM pg_database WHERE datname = 'sentinela'" | grep -q 1 || \
  psql -h localhost -U postgres -c "CREATE DATABASE sentinela"

# Run migrations
npm run db:migrate

# Seed data
npm run db:seed

echo "Database initialized successfully!"
