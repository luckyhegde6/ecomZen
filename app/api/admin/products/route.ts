// app/api/admin/products/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma' // ensure this path is valid in your setup

// GET /api/admin/products
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: { images: true, variants: true },
    })
    // NextResponse.json serializes and sets headers appropriately
    return NextResponse.json(products)
  } catch (err) {
    console.error('GET /api/admin/products error', err)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

// POST /api/admin/products
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, slug, description, price, images } = body

    if (!name || !slug || typeof price !== 'number') {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const created = await prisma.product.create({
      data: {
        name,
        slug,
        description: description || null,
        price,
        inventory: 0,
        images: {
          create: (images || []).map((i: { url: string; alt?: string }) => ({ url: i.url, alt: i.alt || '' })),
        },
      },
      include: { images: true },
    })

    return NextResponse.json(created, { status: 201 })
  } catch (err) {
    console.error('POST /api/admin/products error', err)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}
