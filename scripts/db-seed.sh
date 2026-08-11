#!/bin/bash
echo "🌱 Seeding database..."
npx prisma db seed
echo "✅ Seed complete"
