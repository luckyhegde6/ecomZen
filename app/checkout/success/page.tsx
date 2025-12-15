// app/checkout/success/page.tsx
import React from "react"
import Link from "next/link"

export default function CheckoutSuccess() {
  return (
    <main className="container mx-auto p-6">
      <div className="border rounded-lg p-6 text-center">
        <h1 className="text-2xl font-semibold">Order placed</h1>
        <p className="mt-3 text-muted-foreground">Thank you — your order has been received (demo).</p>
        <div className="mt-4">
          <Link href="/" className="text-purple-300 hover:underline">Back to shopping</Link>
        </div>
      </div>
    </main>
  )
}
