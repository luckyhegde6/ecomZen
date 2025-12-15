#!/usr/bin/env bash
set -euo pipefail

# ensure env exists
if [ ! -f .env.postgres ]; then
  echo ".env.postgres missing"
  exit 1
fi

# read values
USER=$(grep '^POSTGRES_USER=' .env.postgres | cut -d'=' -f2)
PASS=$(grep '^POSTGRES_PASSWORD=' .env.postgres | cut -d'=' -f2)
DB=$(grep '^POSTGRES_DB=' .env.postgres | cut -d'=' -f2)
PORT=$(grep '^POSTGRES_PORT=' .env.postgres | cut -d'=' -f2)

export DATABASE_URL="postgresql://${USER}:${PASS}@localhost:${PORT}/${DB}"

echo "DATABASE_URL=${DATABASE_URL}"
npx prisma generate
npx prisma migrate dev --name init
npx ts-node prisma/seed.ts
