'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'

export default function Navbar() {
    const { data: session, status } = useSession()
    const [open, setOpen] = useState(false)

    const isAdmin = (session?.user as any)?.role === 'admin'

    return (
        <header className="sticky top-0 z-50 border-b border-white/10 bg-gradient-to-b from-[#0b1220]/90 to-[#020617]/90 backdrop-blur">
            <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
                {/* Brand */}
                <Link
                    href="/"
                    className="text-lg font-bold tracking-tight text-white hover:text-indigo-400"
                >
                    MyStore
                </Link>

                {/* Desktop links */}
                <div className="hidden items-center gap-6 md:flex">
                    <Link href="/cart" className="nav-link">
                        Cart
                    </Link>

                    {isAdmin && (
                        <Link href="/admin" className="nav-link">
                            Admin
                        </Link>
                    )}

                    {status === 'authenticated' ? (
                        <button
                            onClick={() => signOut({ callbackUrl: '/' })}
                            className="nav-link"
                        >
                            Sign out
                        </button>
                    ) : (
                        <Link href="/auth/signin" className="nav-link">
                            Sign in
                        </Link>
                    )}
                </div>

                {/* Mobile toggle */}
                <button
                    onClick={() => setOpen(!open)}
                    className="md:hidden rounded-md p-2 text-white hover:bg-white/10"
                    aria-label="Toggle menu"
                >
                    ☰
                </button>
            </nav>

            {/* Mobile menu */}
            {open && (
                <div className="md:hidden border-t border-white/10 bg-[#020617] px-4 py-3">
                    <div className="flex flex-col gap-3">
                        <Link href="/cart" className="mobile-link" onClick={() => setOpen(false)}>
                            Cart
                        </Link>

                        {isAdmin && (
                            <Link href="/admin" className="mobile-link" onClick={() => setOpen(false)}>
                                Admin
                            </Link>
                        )}

                        {status === 'authenticated' ? (
                            <button
                                onClick={() => signOut({ callbackUrl: '/' })}
                                className="mobile-link text-left"
                            >
                                Sign out
                            </button>
                        ) : (
                            <Link href="/auth/signin" className="mobile-link" onClick={() => setOpen(false)}>
                                Sign in
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </header>
    )
}
