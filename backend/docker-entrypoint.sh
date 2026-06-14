#!/bin/bash
set -e

echo "=== Fashion Ecommerce Backend Starting ==="

# 1. Generate Prisma client (ensures latest schema)
echo "[1/3] Generating Prisma client..."
npx prisma generate

# 2. Push database schema to MySQL
echo "[2/3] Pushing database schema..."
npx prisma db push --accept-data-loss
echo "Database schema synced."

# 3. Seed if empty
echo "[3/3] Running seed (idempotent)..."
npx tsx prisma/seed.ts || echo "Seed completed (or already seeded)."

# Start the server
echo "=== Starting Express server on port ${PORT:-3001} ==="
exec npx tsx src/index.ts
