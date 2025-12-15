// scripts/migrate-images.js
// Node 18+ recommended (native fetch).
// Usage:
// 1) create scripts/migrate-list.json with [{ "id": "<productId>", "url": "https://..." }, ...]
// 2) node scripts/migrate-images.js
//
// Output: scripts/migrate-output.json with [{ id, original: "/uploads/...", thumb: "/uploads/thumbs/..." }, ...]

import fs from 'fs'
import path from 'path'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const inputPath = path.join(__dirname, 'migrate-list.json')
const outPath = path.join(__dirname, 'migrate-output.json')
const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
const thumbsDir = path.join(uploadsDir, 'thumbs')

async function ensureDir(p: string) {
  try { await fs.promises.stat(p) } catch (e) { await fs.promises.mkdir(p, { recursive: true }) }
}

async function downloadToFile(url: string, dest: string) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`)
  const buffer = Buffer.from(await res.arrayBuffer())
  await fs.promises.writeFile(dest, buffer)
  return dest
}

async function main() {
  await ensureDir(uploadsDir)
  await ensureDir(thumbsDir)

  if (!fs.existsSync(inputPath)) {
    console.error('No migrate-list.json found at', inputPath)
    process.exit(1)
  }

  const list = JSON.parse(await fs.promises.readFile(inputPath, 'utf-8'))
  const out = []

  for (const item of list) {
    try {
      const url = item.url
      const parsed = new URL(url)
      const base = path.basename(parsed.pathname)
      const safeBase = `${Date.now()}-${base}`

      const dest = path.join(uploadsDir, safeBase)
      await downloadToFile(url, dest)

      // generate thumb
      const ext = path.extname(safeBase)
      const nameOnly = safeBase.replace(ext, '')
      const thumbName = `${nameOnly}-thumb${ext}`
      const thumbPath = path.join(thumbsDir, thumbName)
      await sharp(dest).resize(400, 400, { fit: 'cover' }).toFile(thumbPath)

      const publicOriginal = `/uploads/${safeBase}`
      const publicThumb = `/uploads/thumbs/${thumbName}`

      out.push({ id: item.id, original: publicOriginal, thumb: publicThumb })
      console.log('Migrated', item.id, publicOriginal)
    } catch (err) {
      console.error('Failed to migrate item', item, err)
    }
  }

  await fs.promises.writeFile(outPath, JSON.stringify(out, null, 2), 'utf-8')
  console.log('Wrote mapping to', outPath)
}

main().catch((e) => { console.error(e); process.exit(1) })
