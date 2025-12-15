#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "Starting postgres container with docker-compose..."
docker-compose up -d postgres

CONTAINER_NAME="ecomzen-postgres"
USER=$(grep -E '^POSTGRES_USER=' .env.postgres | cut -d'=' -f2)
DB=$(grep -E '^POSTGRES_DB=' .env.postgres | cut -d'=' -f2)

echo "Waiting for Postgres to be ready (container: ${CONTAINER_NAME})..."
# wait for pg_isready inside container
for i in $(seq 1 30); do
  if docker exec "${CONTAINER_NAME}" pg_isready -U "${USER}" -d "${DB}" >/dev/null 2>&1; then
    echo "Postgres is ready."
    break
  fi
  echo "  still waiting (${i}/30)..."
  sleep 2
done

# final check
if ! docker exec "${CONTAINER_NAME}" pg_isready -U "${USER}" -d "${DB}" >/dev/null 2>&1; then
  echo "Postgres did not become healthy in time. Check docker logs: docker logs ${CONTAINER_NAME}"
  exit 1
fi

echo "Postgres container is up. Now run migrations and seed from host (commands below)."
echo
echo "  export DATABASE_URL=\"postgresql://${USER}:<PASSWORD>@localhost:$(grep -E '^POSTGRES_PORT=' .env.postgres | cut -d'=' -f2)/${DB}\""
echo "  npx prisma generate"
echo "  npx prisma migrate dev --name init"
echo "  npx ts-node prisma/seed.ts"
echo
echo "Or use the helper script: scripts/migrate-and-seed.sh (not provided) to automate migrations."
