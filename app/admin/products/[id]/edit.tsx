import React from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import ProductForm from '@/components/admin/ProductForm'
import { prisma } from '@/lib/prisma'
import { GetServerSidePropsContext } from 'next'

// Helper to infer the specific payload type including relations
async function getProductWithDetails(id: string) {
    return prisma.product.findUnique({ where: { id }, include: { images: true, variants: true } })
}
type ProductWithDetails = NonNullable<Awaited<ReturnType<typeof getProductWithDetails>>>

export default function EditProductPage({ product }: { product: ProductWithDetails | null }) {
    return (
        <AdminLayout>
            <h1 className="text-2xl font-semibold mb-4">Edit Product</h1>
            <ProductForm product={product} />
        </AdminLayout>
    )
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    const id = ctx.params?.id
    if (!id || typeof id !== 'string') {
        return { notFound: true }
    }
    const product = await prisma.product.findUnique({ where: { id }, include: { images: true, variants: true } })
    return { props: { product: product ? JSON.parse(JSON.stringify(product)) : null } }
}
