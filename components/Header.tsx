'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { signIn, signOut, useSession } from 'next-auth/react'

function getCartCount() {
  try {
    const raw = localStorage.getItem('cart')
    if (!raw) return 0
    const items = JSON.parse(raw)
    return items.reduce((s: number, it: { qty?: number }) => s + (it.qty || 1), 0)
  } catch {
    return 0
  }
}

export default function Header() {
  const { data: session } = useSession()
  const [cartCount, setCartCount] = useState(0)
  const [open, setOpen] = useState(false)

  const isAdmin = (session?.user as { role?: string })?.role === 'admin'

  useEffect(() => {

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCartCount(getCartCount())
    const onStorage = () => setCartCount(getCartCount())
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-gradient-to-b from-[#0b1220]/90 to-[#020617]/90 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-14 items-center justify-between">
          {/* Brand */}
          <Link
            href="/"
            className="text-lg font-bold tracking-tight text-white hover:text-indigo-400"
          >
            MyStore
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link href="/" className="nav-link">Home</Link>
            <Link href="/products" className="nav-link">Products</Link>

            <Link href="/cart" className="relative nav-link">
              Cart
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-3 rounded-full bg-indigo-500 px-1.5 text-xs text-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {isAdmin && (
              <Link href="/admin" className="nav-link">
                Admin
              </Link>
            )}

            {session ? (
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="nav-link"
              >
                Sign out
              </button>
            ) : (
              <button onClick={() => signIn()} className="nav-link">
                Sign in
              </button>
            )}
          </nav>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden rounded-md p-2 hover:bg-white/10"
            aria-label="Toggle menu"
          >
            ☰
          </button>
        </div>

        {/* Mobile Menu */}
        {open && (
          <div className="md:hidden border-t border-white/10 py-3">
            <div className="flex flex-col gap-3 text-sm">
              <Link href="/" className="mobile-link" onClick={() => setOpen(false)}>Home</Link>
              <Link href="/products" className="mobile-link" onClick={() => setOpen(false)}>Products</Link>
              <Link href="/cart" className="mobile-link" onClick={() => setOpen(false)}>
                Cart ({cartCount})
              </Link>

              {isAdmin && (
                <Link href="/admin" className="mobile-link" onClick={() => setOpen(false)}>
                  Admin
                </Link>
              )}

              {session ? (
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="mobile-link text-left"
                >
                  Sign out
                </button>
              ) : (
                <button
                  onClick={() => signIn()}
                  className="mobile-link text-left"
                >
                  Sign in
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
