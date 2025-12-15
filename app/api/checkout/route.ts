import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { productId } = body

        if (!productId) {
            return NextResponse.json({ error: 'No productId' }, { status: 400 })
        }

        const product = await prisma.product.findUnique({ where: { id: productId } })

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 })
        }

        // create a pending order (no payment)
        const order = await prisma.order.create({
            data: { total: product.price, status: 'pending' }
        })

        return NextResponse.json({ ok: true, orderId: order.id })
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
