// src/lib/file-utils.ts
import fs from 'fs'
import path from 'path'
import { promisify } from 'util'

const unlink = promisify(fs.unlink)
const stat = promisify(fs.stat)

export async function deleteUploadedFile(publicPath: string) {
    // publicPath expected like "/uploads/1678-name.png" or "/uploads/thumbs/..."
    if (!publicPath) return
    try {
        const normalized = publicPath.startsWith('/') ? publicPath.slice(1) : publicPath
        const filePath = path.join(process.cwd(), normalized)
        await stat(filePath) // will throw if not exists
        await unlink(filePath)
        return true
    } catch (err) {
        // swallow missing-file errors (already deleted) but log others
        // console.warn('deleteUploadedFile error', err)
        return false
    }
}
