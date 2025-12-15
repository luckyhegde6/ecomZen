// src/pages/api/checkout.ts (optional stub)
import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') return res.status(405).end()
    const { productId } = req.body
    if (!productId) return res.status(400).json({ error: 'No productId' })
    const product = await prisma.product.findUnique({ where: { id: productId } })
    if (!product) return res.status(404).json({ error: 'Product not found' })
    // create a pending order (no payment)
    const order = await prisma.order.create({
        data: { total: product.price, status: 'pending' }
    })
    res.status(200).json({ ok: true, orderId: order.id })
}
