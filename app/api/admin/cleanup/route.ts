// app/api/admin/cleanup/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import fs from 'fs'
import path from 'path'

type ImageRow = { url: string | null }

function listFilesInDir(dirPath: string) {
    if (!fs.existsSync(dirPath)) return [] as string[]
    return fs.readdirSync(dirPath).filter((f) => f !== '.gitkeep' && !f.startsWith('.'))
}

function normalizeToPath(urlOrPath: string | null): string | null {
    if (!urlOrPath) return null
    try {
        const u = new URL(urlOrPath, 'http://example.com')
        return u.pathname
    } catch {
        return urlOrPath
    }
}

export async function POST(request: Request) {
    try {
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
        const thumbsDir = path.join(uploadsDir, 'thumbs')

        const candidates: string[] = []

        for (const fname of listFilesInDir(uploadsDir)) {
            candidates.push(`/uploads/${fname}`)
        }
        for (const fname of listFilesInDir(thumbsDir)) {
            candidates.push(`/uploads/thumbs/${fname}`)
        }

        // Fetch referenced URLs from the DB and normalize them
        const images: ImageRow[] = await prisma.image.findMany({ select: { url: true } })
        const referenced = new Set<string>()
        for (const row of images) {
            const p = normalizeToPath(row.url)
            if (p) referenced.add(p)
        }

        const orphans = candidates.filter((p) => !referenced.has(p))

        // parse JSON body to know whether to actually delete
        let body = null
        try {
            body = await request.json()
        } catch {
            body = {}
        }
        const confirm = Boolean(body?.confirm)

        if (!confirm) {
            return NextResponse.json({ ok: true, toDelete: orphans, message: 'Send { "confirm": true } to delete' })
        }

        let deleted = 0
        for (const p of orphans) {
            const fsPath = path.join(process.cwd(), p.replace(/^\//, ''))
            try {
                if (fs.existsSync(fsPath)) {
                    fs.unlinkSync(fsPath)
                    deleted += 1
                }
            } catch (err) {
                console.warn('Failed to delete', fsPath, (err as Error).message)
            }
        }

        return NextResponse.json({ ok: true, deleted })
    } catch (err) {
        console.error('Cleanup error', err)
        return NextResponse.json({ ok: false, error: 'Cleanup failed' }, { status: 500 })
    }
}
