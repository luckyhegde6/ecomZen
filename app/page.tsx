// app/page.tsx
export const dynamic = "force-dynamic"

import React from "react"
import ProductCard from "@/components/ProductCard"
import { prisma } from "@/lib/prisma"

// Infer the type from a dummy call (safe for types)
const getProducts = () => prisma.product.findMany({ include: { images: true } })
type ProductWithImages = Awaited<ReturnType<typeof getProducts>>[number]

export default async function HomePage() {
  let products: ProductWithImages[] = []

  try {
    products = await prisma.product.findMany({
      where: { isActive: true },
      include: { images: true },
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)

    console.error("HomePage: failed to fetch products from DB:", msg)
    products = []
  }

  return (
    <main className="container mx-auto p-6">
      <h1 className="mb-6 text-3xl font-bold">Featured Products</h1>
      {products.length === 0 ? (
        <div className="rounded-lg border p-6">
          <h2 className="text-xl font-semibold">Catalog unavailable</h2>
          <p className="text-sm mt-2 text-muted-foreground">
            The product catalog is currently unavailable. Ensure the DB is running and migrations
            have been applied. The site will display products once the database is reachable.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </main>
  )
}
