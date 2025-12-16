// app/products/[slug]/page.tsx
export const dynamic = 'force-dynamic' // render at request time (no build-time prerender)
import React from 'react'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import ProductCard from '@/components/ProductCard' // optional, or render a full page

type Props = {
    params: Promise<{ slug: string }> | { slug: string }
}

export default async function ProductPage({ params }: Props) {
    // `params` may be a Promise in the App Router. Unwrap it safely.
    const resolvedParams = (params && typeof (params as any).then === 'function')
        ? await (params as Promise<{ slug: string }>)
        : (params as { slug: string })

    const slug = resolvedParams?.slug

    if (!slug || typeof slug !== 'string') {
        // Bad request or route misuse -> show 404
        return notFound()
    }

    // define a helper or just infer inline if possible, but let's be explicit with a typeof trick or simpler:
    // just use `any` temporarily if needed, or better, infer it.
    // simpler approach:
    const getProduct = () => prisma.product.findUnique({ where: { slug: '' }, include: { images: true } })
    type ProductType = NonNullable<Awaited<ReturnType<typeof getProduct>>>

    let product: ProductType | null = null

    try {
        product = await prisma.product.findUnique({
            where: { slug },
            include: { images: true },
        })
    } catch (err: unknown) {
        // Defensive logging without leaking internals to clients
        const msg = err instanceof Error ? err.message : String(err)

        console.error('ProductPage: DB error fetching slug', slug, msg)

        // Prisma panic / unexpected DB error — show notFound to avoid crashing the request
        return notFound()
    }

    if (!product) {
        // No product with that slug -> 404 page
        return notFound()
    }

    return (
        <main className="container mx-auto p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={product.images?.[0]?.url || '/uploads/placeholder.svg'}
                        alt={product.images?.[0]?.alt ?? product.name}
                        className="w-full h-[420px] object-cover rounded"
                    />
                </div>

                <div>
                    <h1 className="text-2xl font-bold">{product.name}</h1>
                    <p className="mt-3 text-lg">
                        ₹
                        {typeof product.price === 'number'
                            ? (product.price / 100).toFixed(2)
                            : '—'}
                    </p>
                    <p className="mt-4 text-muted-foreground">{product.description}</p>
                    {/* add Add-to-cart / variants / etc */}
                </div>
            </div>

            {/* optional: related products - for now this shows the same product as placeholder */}
            <section className="mt-8">
                <h2 className="text-xl font-semibold mb-4">You may also like</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <ProductCard product={product} />
                </div>
            </section>
        </main>
    )
}
