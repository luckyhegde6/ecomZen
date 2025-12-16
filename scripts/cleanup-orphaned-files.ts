// scripts/cleanup-orphaned-files.js
// Node script to remove orphaned files from public/uploads and public/uploads/thumbs
// Usage:
//   node scripts/cleanup-orphaned-files.js [--dry-run]
// Requirements:
//   - set DATABASE_URL env var so Prisma can connect
//   - run from project root
//
// This script will:
// 1) list all files in public/uploads and public/uploads/thumbs (ignoring .gitkeep).
// 2) query Prisma Image table for all image urls.
// 3) determine which files are not referenced in any Image.url and delete them (or log in dry-run).
//
// WARNING: This deletes files on disk. Use --dry-run first.

import fs from 'fs'
import path from 'path'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const DRY = process.argv.includes('--dry-run')
const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
const thumbsDir = path.join(uploadsDir, 'thumbs')

function listFiles(folder: string): string[] {
    if (!fs.existsSync(folder)) return []
    return fs.readdirSync(folder).filter(f => f !== '.gitkeep' && f[0] !== '.')
}

function allCandidatePaths(): string[] {
    const files = []
    for (const fname of listFiles(uploadsDir)) {
        files.push(`/uploads/${fname}`)
    }
    if (fs.existsSync(thumbsDir)) {
        for (const fname of listFiles(thumbsDir)) {
            files.push(`/uploads/thumbs/${fname}`)
        }
    }
    return files
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function main() {
    console.log('Starting cleanup-orphaned-files', DRY ? '(dry-run)' : '')
    const candidates = allCandidatePaths()
    console.log('Found candidates:', candidates.length)

    // Get all image urls from DB
    const images = await prisma.image.findMany({ select: { url: true } })
    const referenced = new Set(images.map(i => {
        if (!i.url) return null
        try {
            // normalize: if URL has domain, try to extract path; else keep as-is
            const u = new URL(i.url, 'http://example.com')
            return u.pathname
        } catch {
            return i.url
        }
    }).filter(Boolean))

    const toDelete = candidates.filter(p => !referenced.has(p))
    console.log('Orphaned files to delete:', toDelete.length)
    for (const p of toDelete) {
        const fsPath = path.join(process.cwd(), p.replace(/^\//, ''))
        if (DRY) {
            console.log('[dry-run] would delete', fsPath)
        } else {
            try {
                fs.unlinkSync(fsPath)
                console.log('Deleted', fsPath)
            } catch (err: unknown) {
                console.error('Failed to delete', fsPath, (err as Error).message)
            }
        }

        await prisma.$disconnect()
        console.log('Done.')
    }

    main().catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
}