# ecomZen
a production-ready Next.js + TypeScript + Tailwind + Prisma/Postgres e-commerce starter (Souled Store vibes) and get you deploy-ready on Netlify.

# Next E-commerce Starter (Local uploads & Admin)

Starter stack:
- Next.js (Pages router) + TypeScript
- TailwindCSS
- Prisma + PostgreSQL
- NextAuth (Credentials provider)
- Local dev uploads saved to `public/uploads/` (development)
- Admin panel for product CRUD

> This project is tuned for local development. For production you should replace local uploads with a cloud storage (S3 / Supabase / DigitalOcean / Cloudinary) and run cleanup in a safe environment.

---

## Quick repo layout

```
/src
/components
/admin
ProductForm.tsx
LocalUploader.tsx
/ui
ConfirmModal.tsx
/pages
/admin
index.tsx
products/[id]/edit.tsx
products/new.tsx
/api
/admin
products/* (CRUD)
upload-local.ts
cleanup.ts
auth/[...nextauth].ts
/prisma
schema.prisma
/scripts
cleanup-orphaned-files.js
migrate-images.js
/public/uploads/ (dev-only)
```

---

## Local setup — step by step

### 1. Prerequisites
- Node.js 18+ (Node 20 recommended)
- PostgreSQL (local or hosted). Alternatively use Supabase / Neon.
- `npm` or `pnpm` / `yarn`

### 2. Clone & install
```bash
git clone <your-repo-url>
cd <your-repo>
npm ci
```

### 3. Environment variables

Create .env in the project root (example .env.example provided). Minimum variables:

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/ecomzen"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
```

### 4. Prisma: generate & migrate
```bash
npx prisma generate
npx prisma migrate dev --name init
```

If you prefer pushing schema without migration history:
```bash
npx prisma db push
```

Seed sample data (if seed script exists)
```bash
npm run seed
```

### 5. Run

```bash
npm run dev
```

### 6.Prepare uploads folder (one-time)
```
mkdir -p public/uploads public/uploads/thumbs
touch public/uploads/.gitkeep public/uploads/thumbs/.gitkeep
chmod -R 775 public/uploads
```
Or run the included script:
```bash
npm run init:uploads
# (ensure package.json has "init:uploads": "bash scripts/init-uploads.sh")
```

### 7. Run dev server
```
npm run dev
# open http://localhost:3000
```

### 8. Admin panel

The admin panel is available at `/admin`.

### 6. Admin panel

The admin panel is available at `/admin`.

### 7. Cleanup orphaned files

```bash
node scripts/cleanup-orphaned-files.js
```

### 8. Migrate images

```bash
node scripts/migrate-images.js
```

### 9. Deploy

Deploy to Netlify. Set environment variables in Netlify dashboard.

## Useful commands (examples)
```bash
# dev
npm run dev

# build
npm run build

# prisma
npx prisma generate
npx prisma migrate dev --name init
npx prisma studio

# cleanup dry-run
DATABASE_URL="..." node scripts/cleanup-orphaned-files.js --dry-run
```