import React from 'react'
import ProductsTable from '@/components/admin/ProductsTable'
import Link from 'next/link'

export default function AdminProductsPage() {
    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Products</h1>
                    <p className="mt-1 text-sm text-gray-500">Manage your product inventory.</p>
                </div>
                <Link
                    href="/admin/products/new"
                    className="px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
                >
                    <span>+ Create Product</span>
                </Link>
            </div>
            <ProductsTable />
        </div>
    )
}
