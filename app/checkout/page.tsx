// app/checkout/page.tsx
"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

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
  const { data: session, status } = useSession()
  const [items, setItems] = useState<CartItem[]>([])
  const [name, setName] = useState("")
  const [mobile, setMobile] = useState("")
  const [address, setAddress] = useState("")
  const [busy, setBusy] = useState(false)
  const router = useRouter()

  const [fees, setFees] = useState({
    delivery: 0,
    shipping: 0,
    platform: 0,
    discount: 0,
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/checkout")
    }
  }, [status, router])

  useEffect(() => {
    const cart = getCartFromStorage()
    setItems(cart)
  }, [])

  const subtotal = items.reduce((s, it) => s + it.qty * it.price, 0)

  useEffect(() => {
    // Logic: If order value < 999, add fees.
    // Price in cents/paise? Original code had `(total / 100).toFixed(2)` which implies price is in smallest unit (e.g. cents).
    // Assuming price is in cents (or paise). 999 in standard currency = 99900.
    // Let's assume price is in *cents/paise*.

    // However, if the user meant "999 rupees", that's 99900 paise.
    // Let's assume the threshold is 999 * 100.

    // Actually, looking at `₹{(total / 100).toFixed(2)}`, yes, it's divided by 100.
    const threshold = 999 * 100

    if (subtotal > 0 && subtotal < threshold) {
      setFees({
        delivery: 40 * 100, // ₹40
        shipping: 20 * 100, // ₹20
        platform: 10 * 100, // ₹10
        discount: 0,
      })
    } else {
      setFees({
        delivery: 0,
        shipping: 0,
        platform: 0,
        discount: 0, // Implement discount logic here if needed
      })
    }
  }, [subtotal])

  const total = subtotal + fees.delivery + fees.shipping + fees.platform - fees.discount

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault()
    if (items.length === 0) {
      alert("Cart is empty")
      return
    }
    setBusy(true)

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          name,
          mobile,
          address,
          fees,
          total,
        }),
      })

      if (res.ok) {
        // Clear cart
        localStorage.removeItem("cart")
        const data = await res.json()
        router.push(`/orders/${data.id}`) // Redirect to tracking page/order detail
      } else {
        const err = await res.json()
        alert(err.message || "Failed to place order")
      }
    } catch (error) {
      console.error(error)
      alert("Something went wrong")
    } finally {
      setBusy(false)
    }
  }

  if (status === "loading") return <div className="p-6">Loading...</div>

  return (
    <main className="container mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Checkout</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <form onSubmit={placeOrder} className="md:col-span-2 border rounded-lg p-6 space-y-4">
          <h2 className="font-semibold">Shipping Details</h2>
          <label className="block">
            <span className="text-sm text-muted-foreground">Full name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 w-full px-3 py-2 rounded border bg-transparent" />
          </label>

          <label className="block">
            <span className="text-sm text-muted-foreground">Mobile Number</span>
            <input value={mobile} type="tel" onChange={(e) => setMobile(e.target.value)} required className="mt-1 w-full px-3 py-2 rounded border bg-transparent" />
          </label>

          <label className="block">
            <span className="text-sm text-muted-foreground">Address</span>
            <textarea value={address} onChange={(e) => setAddress(e.target.value)} required className="mt-1 w-full px-3 py-2 rounded border bg-transparent" />
          </label>

          <div>
            <h3 className="font-semibold">Payment</h3>
            <p className="text-sm text-muted-foreground">Cash on Delivery (Standard for this demo)</p>
          </div>

          <div>
            <button type="submit" disabled={busy} className="bg-purple-600 text-white px-4 py-2 rounded w-full md:w-auto">
              {busy ? "Placing order..." : `Place order — ₹{(total / 100).toFixed(2)}`}
            </button>
          </div>
        </form>

        <aside className="border rounded-lg p-4 h-fit">
          <h3 className="font-semibold">Order summary</h3>
          <ul className="mt-3 space-y-3">
            {items.map((it) => (
              <li key={it.id} className="flex justify-between text-sm">
                <span>{it.name} × {it.qty}</span>
                <span>₹{((it.price * it.qty) / 100).toFixed(2)}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4 border-t pt-3 space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>₹{(subtotal / 100).toFixed(2)}</span>
            </div>
            {fees.delivery > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>Delivery Fee</span>
                <span>₹{(fees.delivery / 100).toFixed(2)}</span>
              </div>
            )}
            {fees.shipping > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping Fee</span>
                <span>₹{(fees.shipping / 100).toFixed(2)}</span>
              </div>
            )}
            {fees.platform > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>Platform Fee</span>
                <span>₹{(fees.platform / 100).toFixed(2)}</span>
              </div>
            )}
            {fees.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-₹{(fees.discount / 100).toFixed(2)}</span>
              </div>
            )}
          </div>

          <div className="mt-4 border-t pt-3 font-semibold flex justify-between">
            <span>Total</span>
            <span>₹{(total / 100).toFixed(2)}</span>
          </div>
        </aside>
      </div>
    </main>
  )
}
