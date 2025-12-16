// app/cart/page.tsx
"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

type CartItem = {
  id: string
  name: string
  price: number // integer cents
  qty: number
  image?: string
  slug?: string
}

function getCartFromStorage(): CartItem[] {
  try {
    const raw = localStorage.getItem("cart")
    if (!raw) return []
    return JSON.parse(raw)
  } catch {
    return []
  }
}

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([])
  const router = useRouter()

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(getCartFromStorage())
  }, [])

  function saveCart(next: CartItem[]) {
    setItems(next)
    localStorage.setItem("cart", JSON.stringify(next))
  }

  function updateQty(id: string, qty: number) {
    const next = items.map((it) => (it.id === id ? { ...it, qty: Math.max(1, qty) } : it))
    saveCart(next)
  }

  function removeItem(id: string) {
    const next = items.filter((it) => it.id !== id)
    saveCart(next)
  }

  const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0)
  const formatted = (subtotal / 100).toFixed(2)

  if (items.length === 0) {
    return (
      <main className="container mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-4">Your cart</h1>
        <div className="rounded-lg border p-6">
          <p className="text-muted-foreground">Your cart is empty.</p>
          <Link href="/" className="inline-block mt-4 text-purple-300 hover:underline">Continue shopping</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="container mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Your cart</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          {items.map((it) => (
            <div key={it.id} className="flex items-center gap-4 border rounded p-3">
              <img src={it.image || "/uploads/placeholder-150.png"} alt={it.name} className="w-20 h-20 object-cover rounded" />
              <div className="flex-1">
                <Link href={`/products/${it.slug || ""}`} className="font-semibold text-white/90">{it.name}</Link>
                <div className="text-sm text-muted-foreground">₹{(it.price / 100).toFixed(2)}</div>
                <div className="mt-2 flex items-center gap-2">
                  <button onClick={() => updateQty(it.id, it.qty - 1)} className="px-2 py-1 border rounded">-</button>
                  <div className="px-3">{it.qty}</div>
                  <button onClick={() => updateQty(it.id, it.qty + 1)} className="px-2 py-1 border rounded">+</button>
                  <button onClick={() => removeItem(it.id)} className="ml-3 text-sm text-red-400">Remove</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="border rounded-lg p-4">
          <h3 className="font-semibold">Order summary</h3>
          <div className="mt-3">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>₹{formatted}</span>
            </div>
            <div className="mt-4">
              <button
                onClick={() => router.push("/checkout")}
                className="w-full bg-purple-600 text-white py-2 rounded"
              >
                Proceed to checkout
              </button>
            </div>
          </div>
        </aside>
      </div>
    </main>
  )
}
