// app/products/page.tsx
export const dynamic = "force-dynamic"

import { prisma } from "@/lib/prisma"
import ProductCard from "@/components/ProductCard"
import { Product } from "@prisma/client"

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: { images: true },
  })

  return (
    <main className="mx-auto max-w-7xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold">All Products</h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
        {products.map((p: Product) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </main>
  )
}
