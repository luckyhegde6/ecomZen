// app/checkout/page.tsx
"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

type CartItem = { id: string; name: string; price: number; qty: number }

function getCartFromStorage(): CartItem[] {
  try {
    const raw = localStorage.getItem("cart")
    if (!raw) return []
    return JSON.parse(raw)
  } catch {
    return []
  }
}

export default function CheckoutPage() {
  const [items, setItems] = useState<CartItem[]>([])
  const [name, setName] = useState("")
  const [address, setAddress] = useState("")
  const [busy, setBusy] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(getCartFromStorage())
  }, [])

  const total = items.reduce((s, it) => s + it.qty * it.price, 0)

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault()
    if (items.length === 0) {
      alert("Cart is empty")
      return
    }
    setBusy(true)

    // Simulate order placement (in real app post to /api/orders)
    await new Promise((r) => setTimeout(r, 900))

    // Clear cart
    localStorage.removeItem("cart")

    // Redirect to success page
    router.push("/checkout/success")
  }

  return (
    <main className="container mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Checkout</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <form onSubmit={placeOrder} className="md:col-span-2 border rounded-lg p-6 space-y-4">
          <h2 className="font-semibold">Shipping</h2>
          <label className="block">
            <span className="text-sm text-muted-foreground">Full name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 w-full px-3 py-2 rounded border bg-transparent" />
          </label>

          <label className="block">
            <span className="text-sm text-muted-foreground">Address</span>
            <textarea value={address} onChange={(e) => setAddress(e.target.value)} required className="mt-1 w-full px-3 py-2 rounded border bg-transparent" />
          </label>

          <div>
            <h3 className="font-semibold">Payment</h3>
            <p className="text-sm text-muted-foreground">This demo doesn&apos;t process payments — integrate Stripe or similar for real payments.</p>
          </div>

          <div>
            <button type="submit" disabled={busy} className="bg-purple-600 text-white px-4 py-2 rounded">
              {busy ? "Placing order…" : `Place order — ₹${(total / 100).toFixed(2)}`}
            </button>
          </div>
        </form>

        <aside className="border rounded-lg p-4">
          <h3 className="font-semibold">Order summary</h3>
          <ul className="mt-3 space-y-3">
            {items.map((it) => (
              <li key={it.id} className="flex justify-between">
                <span>{it.name} × {it.qty}</span>
                <span>₹{((it.price * it.qty) / 100).toFixed(2)}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4 border-t pt-3 text-muted-foreground flex justify-between">
            <span>Total</span>
            <span>₹{(total / 100).toFixed(2)}</span>
          </div>
        </aside>
      </div>
    </main>
  )
}
