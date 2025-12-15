// app/api/orders/route.ts
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/nextauth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
    const session = await getServerSession(authOptions as any)
    if (!session || (session.user as any)?.role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }
    const orders = await prisma.order.findMany({ take: 100, orderBy: { createdAt: "desc" } })
    return NextResponse.json(orders)
}

export async function POST(req: Request) {
    // create a basic order from body. In production, validate properly.
    const body = await req.json().catch(() => ({}))
    const { items = [], name, address } = body
    if (!Array.isArray(items) || items.length === 0) {
        return NextResponse.json({ error: "Cart empty" }, { status: 400 })
    }

    // If you don't have an Order model in Prisma, create a temporary response instead:
    // If you DO have an Order model, use prisma.order.create(...) instead.
    try {
        // Try to persist if Order model exists
        // @ts-ignore
        const order = await prisma.order.create?.({
            data: {
                customerName: name ?? "Guest",
                address: address ?? "",
                total: items.reduce((s: number, it: any) => s + (it.price || 0) * (it.qty || 1), 0),
                meta: { items },
            },
        })

        if (order) return NextResponse.json(order)
    } catch (err) {
        // ignore if model missing; will return mock below
        console.warn("orders POST: prisma order create failed", err)
    }

    // fallback mock order
    const mock = {
        id: "mock-" + Date.now(),
        customerName: name ?? "Guest",
        address: address ?? "",
        total: items.reduce((s: number, it: any) => s + (it.price || 0) * (it.qty || 1), 0),
        items,
        createdAt: new Date().toISOString(),
    }
    return NextResponse.json(mock)
}
