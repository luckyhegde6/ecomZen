/* eslint-disable @typescript-eslint/no-require-imports */
// scripts/local-dev.cjs
// CommonJS orchestrator for local dev (uses `docker compose --env-file .env.postgres`)

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const envPostgresPath = path.join(ROOT, '.env.postgres')

function print(msg) {
  console.log(msg)
}

function readEnvFile(p) {
  if (!fs.existsSync(p)) return {}
  const raw = fs.readFileSync(p, 'utf8')
  const lines = raw.split(/\r?\n/).filter(Boolean).map((l) => l.trim())
  const obj = {}
  for (const line of lines) {
    if (line.startsWith('#')) continue
    const parts = line.split('=')
    if (parts.length >= 2) {
      const key = parts[0]
      let val = parts.slice(1).join('=')
      val = val.replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1')
      obj[key] = val
    }
  }
  return obj
}

function sh(cmd, opts = {}) {
  console.log('> ' + cmd)
  return execSync(cmd, { stdio: 'inherit', cwd: ROOT, env: process.env, ...opts })
}

function shCapture(cmd) {
  try {
    return execSync(cmd, { cwd: ROOT, env: process.env, encoding: 'utf8' }).trim()
  } catch {
    return null
  }
}

async function main() {
  print('local-dev: reading .env.postgres ...')
  const envp = readEnvFile(envPostgresPath)

  const POSTGRES_USER = envp.POSTGRES_USER || 'postgres'
  const POSTGRES_PASSWORD = envp.POSTGRES_PASSWORD || 'postgres'
  const POSTGRES_DB = envp.POSTGRES_DB || 'ecomzen'
  const POSTGRES_PORT = envp.POSTGRES_PORT || '5432'
  const CONTAINER = 'ecomzen-postgres'

  // If an old container exists but was initialized incorrectly, remove it first
  try {
    const existing = shCapture(`docker ps -a --filter "name=${CONTAINER}" --format "{{.Names}} {{.Status}}"`)
    if (existing && existing.length > 0) {
      print('local-dev: found existing container; removing to ensure clean init...')
      sh(`docker rm -f ${CONTAINER} || true`)
    }
  } catch (_e) {
    // ignore
  }

  print('local-dev: bringing up postgres using docker compose and .env.postgres ...')
  try {
    // use the v2-style `docker compose` with explicit env-file so compose reads it for interpolation
    sh(`docker compose --env-file .env.postgres up -d postgres`)
  } catch (err) {
    console.error('local-dev: failed to start container via docker compose', err)
    process.exit(1)
  }

  print('local-dev: waiting for Postgres to become ready (pg_isready) ...')
  let ready = false
  for (let i = 0; i < 60; i++) {
    const cmd = `docker exec ${CONTAINER} pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB} -h localhost -p 5432`
    try {
      const out = shCapture(cmd)
      if (out && out.toLowerCase().includes('accepting connections')) {
        ready = true
        print('local-dev: postgres reports ready.')
        break
      }
    } catch {
      // continue
    }
    process.stdout.write('.')
    await new Promise((r) => setTimeout(r, 1500))
  }

  if (!ready) {
    console.error('\nlocal-dev: Postgres did not become ready in time. Check logs: docker logs ' + CONTAINER)
    process.exit(1)
  }

  print('\nlocal-dev: checking whether DB already has tables...')
  const psqlCmd = `docker exec ${CONTAINER} psql -U ${POSTGRES_USER} -d ${POSTGRES_DB} -c "\\dt public.*" -t -A`
  let tablesList = null
  try {
    tablesList = shCapture(psqlCmd)
  } catch (_err) {
    // ignore; tablesList will be null
  }

  const hasTables = tablesList && tablesList.trim().length > 0

  if (!hasTables) {
    print('local-dev: no tables found — running prisma generate, migrate and seed.')

    const databaseUrl = `postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:${POSTGRES_PORT}/${POSTGRES_DB}`
    process.env.DATABASE_URL = databaseUrl
    print('local-dev: using DATABASE_URL=' + databaseUrl)

    try {
      sh('npx prisma generate')
      sh('npx prisma migrate dev --name init --schema=prisma/schema.prisma')

      if (fs.existsSync(path.join(ROOT, 'prisma', 'seed.ts'))) {
        sh('npx ts-node prisma/seed.ts')
      } else {
        print('local-dev: no prisma/seed.ts found — skipping seed step.')
      }

      print('local-dev: migration + seed complete. Starting Next dev server (npm run dev).')
      sh('npm run dev')
    } catch (err) {
      console.error('local-dev: error while migrating/seeding:', err)
      process.exit(1)
    }
  } else {
    print('local-dev: DB already has tables — skipping migrate+seed and launching dev server.')
    sh('npm run dev')
  }
}

main().catch((err) => {
  console.error('local-dev: fatal error', err)
  process.exit(1)
})
