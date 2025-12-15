import React from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import ProductForm from '@/components/admin/ProductForm'
import { prisma } from '@/lib/prisma'

export default function EditProductPage({ product }: { product: any }) {
    return (
        <AdminLayout>
            <h1 className="text-2xl font-semibold mb-4">Edit Product</h1>
            <ProductForm product={product} />
        </AdminLayout>
    )
}

export async function getServerSideProps(ctx: any) {
    const id = ctx.params.id
    const product = await prisma.product.findUnique({ where: { id }, include: { images: true, variants: true } })
    return { props: { product: product ? JSON.parse(JSON.stringify(product)) : null } }
}
