// app/api/admin/upload-local/route.ts
import { NextResponse, NextRequest } from 'next/server'
import formidable from 'formidable'
import fs from 'fs'
import path from 'path'
import { promisify } from 'util'
import sharp from 'sharp'

const mkdir = promisify(fs.mkdir)
const rename = promisify(fs.rename)
const stat = promisify(fs.stat)

async function ensureFolderExists(folderPath: string) {
    try {
        await stat(folderPath)
    } catch {
        await mkdir(folderPath, { recursive: true })
    }
}

function normalizeFilename(name: string) {
    return name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\-_.]/g, '')
}

export async function POST(request: NextRequest) {
    try {
        const uploadsFolder = path.join(process.cwd(), 'public', 'uploads')
        const thumbsFolder = path.join(uploadsFolder, 'thumbs')
        await ensureFolderExists(uploadsFolder)
        await ensureFolderExists(thumbsFolder)

        // formidable expects Node's IncomingMessage. We can access the raw Node request via (request as any).req
        const nodeReq = (request as any).req
        if (!nodeReq) {
            return NextResponse.json({ error: 'Unable to access raw request' }, { status: 500 })
        }

        const form = formidable({
            multiples: true,
            keepExtensions: true,
            uploadDir: uploadsFolder,
        })

        const parseForm = () =>
            new Promise<{ fields: formidable.Fields; files: formidable.Files }>((resolve, reject) => {
                form.parse(nodeReq, (err, fields, files) => {
                    if (err) return reject(err)
                    resolve({ fields, files })
                })
            })

        const { files } = await parseForm()

        if (!files || !files.file) {
            return NextResponse.json({ error: 'No file provided. Expect field named `file`' }, { status: 400 })
        }

        const rawFiles = Array.isArray(files.file) ? files.file : [files.file]
        const outFiles: Array<{ url: string; thumb?: string; name: string; size?: number; fieldName?: string }> = []

        for (const f of rawFiles) {
            // treat formidable file as any to access different possible properties safely
            const fileAny = f as any
            const originalName = fileAny.originalFilename || fileAny.newFilename || fileAny.name || 'upload'
            const ext = path.extname(String(originalName)) || path.extname(fileAny.filepath || '') || ''
            const safeName = normalizeFilename(String(originalName).replace(ext, ''))
            const timestamp = Date.now()
            const newFilename = `${timestamp}-${safeName}${ext}`

            const oldPath = fileAny.filepath || fileAny.path || fileAny.tempFilePath || fileAny.path
            if (!oldPath) {
                // fallback: skip this file if we can't find a path
                console.warn('Skipping file without filepath', fileAny)
                continue
            }
            const newPath = path.join(uploadsFolder, newFilename)

            // move/rename temp file to final location
            await rename(oldPath, newPath)

            // create thumbnail (best-effort)
            const thumbFilename = `${timestamp}-${safeName}-thumb${ext}`
            const thumbPath = path.join(thumbsFolder, thumbFilename)
            try {
                await sharp(newPath).resize(400, 400, { fit: 'cover' }).toFile(thumbPath)
            } catch (err) {
                console.warn('Sharp thumbnail generation failed for', newPath, err)
            }

            // determine field name safely (some formidable variants use `fieldname` or `field`)
            const fieldName =
                (fileAny.fieldname as string) ??
                (fileAny.field as string) ??
                (fileAny.name as string) ??
                'file'

            const publicUrl = `/uploads/${newFilename}`
            const thumbPublic = `/uploads/thumbs/${thumbFilename}`

            outFiles.push({
                url: publicUrl,
                thumb: thumbPublic,
                name: newFilename,
                size: fileAny.size,
                fieldName,
            })
        }

        return NextResponse.json({ ok: true, files: outFiles })
    } catch (err) {
        console.error('upload-local error', err)
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }
}
