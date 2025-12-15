// src/components/admin/AdminClient.tsx
'use client'
import React, { useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import Link from 'next/link'
import ConfirmModal from '@/components/ui/ConfirmModal'

export default function AdminClient({ products }: { products: any[] }) {
    const [modalOpen, setModalOpen] = useState(false)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [busy, setBusy] = useState(false)

    function confirmDelete(id: string) {
        setDeletingId(id)
        setModalOpen(true)
    }

    async function doDelete() {
        if (!deletingId) return
        setBusy(true)
        try {
            const res = await fetch(`/api/admin/products/${deletingId}`, { method: 'DELETE' })
            if (!res.ok) {
                const j = await res.json().catch(() => ({ message: 'Delete failed' }))
                alert(j.message || 'Failed to delete')
            } else {
                window.location.reload()
            }
        } catch (err) {
            console.error(err)
            alert('Delete error')
        } finally {
            setBusy(false)
            setModalOpen(false)
            setDeletingId(null)
        }
    }

    return (
        <AdminLayout>
            <h1 className="text-2xl font-semibold mb-4">Products</h1>
            <div className="mb-4">
                <Link href="/admin/products/new"><a className="px-4 py-2 bg-black text-white rounded">Create product</a></Link>
            </div>

            <div className="grid gap-4">
                {products.map((p) => (
                    <div key={p.id} className="border rounded p-4 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 bg-gray-100 rounded overflow-hidden">
                                {p.images?.[0] ? (
                                    typeof p.images[0] === 'object' ? (
                                        <img src={p.images[0].thumb || p.images[0].url} alt={p.images[0].alt || p.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                                    )
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No image</div>
                                )}
                            </div>
                            <div>
                                <div className="font-semibold">{p.name}</div>
                                <div className="text-sm text-gray-600">₹{(p.price / 100).toFixed(2)}</div>
                                <div className="text-xs text-gray-500 mt-1">Slug: {p.slug}</div>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Link href={`/admin/products/${p.id}/edit`}><a className="px-3 py-1 border rounded text-sm">Edit</a></Link>
                            <button onClick={() => confirmDelete(p.id)} className="px-3 py-1 border rounded text-sm text-red-600">Delete</button>
                        </div>
                    </div>
                ))}
            </div>

            <ConfirmModal
                open={modalOpen}
                title="Delete product"
                message="This will permanently delete the product and remove local uploaded image files (dev). Are you sure?"
                onCancel={() => setModalOpen(false)}
                onConfirm={doDelete}
                confirmLabel={busy ? 'Deleting…' : 'Yes, delete'}
            />
        </AdminLayout>
    )
}
