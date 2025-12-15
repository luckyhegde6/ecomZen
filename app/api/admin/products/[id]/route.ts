// app/api/admin/products/[id]/route.ts
import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { deleteUploadedFile } from '@/lib/file-utils'

type RouteParams = { id: string }
type ContextWithParams = { params: RouteParams | Promise<RouteParams> }

async function resolveParams(context: ContextWithParams) {
    // context.params may be a Promise or an object depending on environment
    return await Promise.resolve(context.params)
}

/**
 * GET /api/admin/products/:id
 */
export async function GET(_request: NextRequest, context: ContextWithParams) {
    const params = await resolveParams(context)
    try {
        const product = await prisma.product.findUnique({
            where: { id: params.id },
            include: { images: true, variants: true },
        })
        if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })
        return NextResponse.json(product)
    } catch (err) {
        console.error('GET product error', err)
        return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
    }
}

/**
 * PUT /api/admin/products/:id
 * Body: { name, slug, description, price, images: [{ url, alt?, thumb? }, ...] }
 *
 * Deletes previously stored local files for images on the existing product
 * before creating new image records (dev cleanup).
 */
export async function PUT(request: NextRequest, context: ContextWithParams) {
    const params = await resolveParams(context)
    try {
        const body = await request.json()
        const { name, slug, description, price, images } = body

        // fetch existing images to cleanup files
        const existing = await prisma.product.findUnique({ where: { id: params.id }, include: { images: true } })
        if (existing?.images && existing.images.length) {
            for (const img of existing.images as any[]) {
                await deleteUploadedFile(img.url)
                try {
                    const base = img.url?.split('/').pop()
                    if (base) {
                        const thumbPath = `/uploads/thumbs/${base.replace(/(\.\w+)$/, '-thumb$1')}`
                        await deleteUploadedFile(thumbPath)
                    }
                } catch (_) { }
            }
        }

        const updated = await prisma.product.update({
            where: { id: params.id },
            data: {
                name,
                slug,
                description,
                price,
                images: {
                    deleteMany: {},
                    create: (images || []).map((i: any) => ({ url: i.url, alt: i.alt || '' })),
                },
            },
            include: { images: true },
        })

        return NextResponse.json(updated)
    } catch (err) {
        console.error('PUT product error', err)
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
    }
}

/**
 * DELETE /api/admin/products/:id
 *
 * Deletes product and attempts to delete local image files (dev).
 */
export async function DELETE(_request: NextRequest, context: ContextWithParams) {
    const params = await resolveParams(context)
    try {
        const product = await prisma.product.findUnique({ where: { id: params.id }, include: { images: true } })
        if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })

        if (product.images?.length) {
            for (const img of product.images as any[]) {
                await deleteUploadedFile(img.url)
                try {
                    const base = img.url?.split('/').pop()
                    if (base) {
                        const thumbPath = `/uploads/thumbs/${base.replace(/(\.\w+)$/, '-thumb$1')}`
                        await deleteUploadedFile(thumbPath)
                    }
                } catch (_) { }
            }
        }

        await prisma.product.delete({ where: { id: params.id } })
        return NextResponse.json({ ok: true })
    } catch (err) {
        console.error('DELETE product error', err)
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
    }
}
