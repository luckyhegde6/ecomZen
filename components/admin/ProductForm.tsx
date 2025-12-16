"use client"
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import LocalUploader from '@/components/admin/LocalUploader'

type ImageItem = { url: string; thumb?: string; alt?: string }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ProductForm({ product }: { product?: any }) {
    const router = useRouter()
    const [name, setName] = useState(product?.name || '')
    const [slug, setSlug] = useState(product?.slug || '')
    const [desc, setDesc] = useState(product?.description || '')
    const [price, setPrice] = useState(product ? (product.price / 100).toFixed(2) : '0.00')
    const [images, setImages] = useState<ImageItem[]>(product?.images || [])
    const [loading, setLoading] = useState(false)
    const [imageUrl, setImageUrl] = useState('')

    function addImageUrl() {
        if (!imageUrl) return
        setImages(prev => [...prev, { url: imageUrl, alt: '' }])
        setImageUrl('')
    }

    function removeImage(idx: number) {
        setImages(prev => prev.filter((_, i) => i !== idx))
    }

    function moveUp(idx: number) {
        if (idx === 0) return
        setImages(prev => {
            const arr = [...prev]
            const tmp = arr[idx - 1]; arr[idx - 1] = arr[idx]; arr[idx] = tmp
            return arr
        })
    }

    function moveDown(idx: number) {
        setImages(prev => {
            if (idx === prev.length - 1) return prev
            const arr = [...prev]
            const tmp = arr[idx + 1]; arr[idx + 1] = arr[idx]; arr[idx] = tmp
            return arr
        })
    }

    function handleLocalUploaded(files: { url: string; thumb?: string }[]) {
        setImages(prev => [...prev, ...files.map(f => ({ url: f.url, thumb: f.thumb, alt: '' }))])
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        try {
            const body = {
                name,
                slug,
                description: desc,
                price: Math.round(parseFloat(price || '0') * 100),
                images
            }
            const method = product ? 'PUT' : 'POST'
            const idPart = product ? `/${product.id}` : ''
            const res = await fetch(`/api/admin/products${idPart}`, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            })
            if (!res.ok) {
                const err = await res.json()
                alert(err.message || 'Error saving product')
                setLoading(false)
                return
            }
            router.push('/admin')
        } catch (err) {
            console.error(err)
            alert('Unexpected error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column: General Info */}
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name</label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-gray-400"
                            placeholder="e.g. Classic White T-Shirt"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Slug</label>
                        <input
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-gray-400 bg-gray-50"
                            placeholder="classic-white-t-shirt"
                        />
                        <p className="mt-1 text-xs text-gray-500">Auto-generated for URL friendly names.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Price (INR)</label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-gray-500">₹</span>
                            <input
                                type="number"
                                step="0.01"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                className="w-full pl-8 pr-4 py-2 rounded-lg border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all font-mono"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                        <textarea
                            value={desc}
                            onChange={(e) => setDesc(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all min-h-[160px] resize-y placeholder:text-gray-400"
                            placeholder="Describe the product details..."
                        />
                    </div>
                </div>

                {/* Right Column: Images */}
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Media</label>

                        {/* URL Importer */}
                        <div className="flex gap-2 mb-4 p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                            <input
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-md text-sm outline-none focus:border-black"
                                placeholder="Paste image URL here..."
                            />
                            <button
                                type="button"
                                onClick={addImageUrl}
                                className="px-4 py-2 bg-white text-black text-sm font-medium border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                            >
                                Add URL
                            </button>
                        </div>

                        {/* Local Uploader */}
                        <div className="mb-6">
                            <LocalUploader onUploaded={(files) => handleLocalUploaded(files)} />
                        </div>

                        {/* Image Gallery */}
                        <div className="space-y-3">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Gallery ({images.length})</p>
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                                {images.map((img, idx) => (
                                    <div key={idx} className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={img.thumb || img.url}
                                            alt={img.alt || `Product ${idx + 1}`}
                                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                        />

                                        {/* Overlay Actions */}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => moveUp(idx)}
                                                    className="p-1.5 bg-white/90 rounded-full hover:bg-white text-gray-800 disabled:opacity-50"
                                                    disabled={idx === 0}
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => moveDown(idx)}
                                                    className="p-1.5 bg-white/90 rounded-full hover:bg-white text-gray-800 disabled:opacity-50"
                                                    disabled={idx === images.length - 1}
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                                </button>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeImage(idx)}
                                                className="px-3 py-1 bg-red-500 text-white text-xs font-medium rounded-full hover:bg-red-600 transition-colors"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {images.length === 0 && (
                                    <div className="col-span-full py-8 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                                        <div className="w-12 h-12 mb-2 rounded-full bg-gray-50 flex items-center justify-center">
                                            <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        </div>
                                        <span className="text-sm">No images added</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-100">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-6 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-8 py-2.5 text-sm font-semibold text-white bg-black rounded-lg hover:bg-gray-800 focus:ring-4 focus:ring-gray-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                    disabled={loading}
                >
                    {loading && (
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    )}
                    {product ? 'Save Changes' : 'Create Product'}
                </button>
            </div>
        </form>
    )
}
