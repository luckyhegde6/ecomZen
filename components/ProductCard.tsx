"use client"
import React from "react"
import Link from "next/link"

export default function ProductCard({ product }: { product: any }) {
    if (!product) return null

    function addToCart() {
        try {
            const raw = localStorage.getItem("cart")
            const cart = raw ? JSON.parse(raw) : []
            const id = product.id ?? product.slug
            const existing = cart.find((c: any) => c.id === id)
            if (existing) {
                existing.qty = (existing.qty || 1) + 1
            } else {
                cart.push({
                    id,
                    name: product.name,
                    price: product.price ?? 0,
                    qty: 1,
                    slug: product.slug,
                    image: product.images?.[0]?.url ?? "/uploads/placeholder-400.png",
                })
            }
            localStorage.setItem("cart", JSON.stringify(cart))
            // notify other tabs / header
            window.dispatchEvent(new Event("storage"))
            // simple UI feedback
            alert("Added to cart")
        } catch (err) {
            console.error("addToCart:", err)
        }
    }

    return (
        <div className="border rounded-lg p-4 hover:shadow bg-transparent">
            <Link href={`/products/${product.slug}`} className="block">
                <img
                    src={product.images?.[0]?.url || '/uploads/placeholder-400.png'}
                    alt={product.images?.[0]?.alt || product.name}
                    className="w-full h-64 object-cover rounded"
                />
                <h3 className="mt-3 font-semibold">{product.name}</h3>
            </Link>

            <div className="mt-2 flex items-center justify-between">
                <div className="text-lg">₹{(product.price ?? 0) / 100}</div>
                <button onClick={addToCart} className="px-3 py-1 bg-purple-600 text-white rounded text-sm">Add to cart</button>
            </div>
        </div>
    )
}
