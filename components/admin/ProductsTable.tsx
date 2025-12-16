"use client"
import React, { useEffect, useState } from 'react'
import Link from 'next/link'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ProductsTable() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [products, setProducts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadProducts()
    }, [])

    async function loadProducts() {
        try {
            const res = await fetch('/api/admin/products')
            if (res.ok) {
                setProducts(await res.json())
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    async function deleteProduct(id: string) {
        if (!confirm('Are you sure you want to delete this product?')) return
        try {
            const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
            if (res.ok) {
                setProducts(prev => prev.filter(p => p.id !== id))
            } else {
                alert('Failed to delete')
            }
        } catch (_err) {
            alert('Error deleting')
        }
    }

    if (loading) return <div>Loading products...</div>

    return (
        <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-100">
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                        <th className="px-6 py-4 font-semibold text-gray-700">Product</th>
                        <th className="px-6 py-4 font-semibold text-gray-700">Price</th>
                        <th className="px-6 py-4 font-semibold text-gray-700 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {products.length === 0 ? (
                        <tr>
                            <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                                No products found. <Link href="/admin/products/new" className="text-black underline">Create one?</Link>
                            </td>
                        </tr>
                    ) : (
                        products.map(product => (
                            <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden shrink-0 border border-gray-200">
                                            {product.images?.[0] ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={product.images[0].url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">{product.name}</div>
                                            <div className="text-xs text-gray-500">{product.slug}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-mono text-gray-600">
                                    ₹{(product.price / 100).toFixed(2)}
                                </td>
                                <td className="px-6 py-4 text-right space-x-3">
                                    <Link
                                        href={`/admin/products/${product.id}`}
                                        className="text-sm font-medium text-gray-600 hover:text-black transition-colors"
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => deleteProduct(product.id)}
                                        className="text-sm font-medium text-red-500 hover:text-red-700 transition-colors"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    )
}
