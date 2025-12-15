// components/Nav.tsx
"use client"

import Link from "next/link"
import { signOut, useSession } from "next-auth/react"
import React from "react"

export default function Nav() {
    const { data: session } = useSession()

    return (
        <header className="w-full border-b border-white/10">
            <nav className="container mx-auto px-6 py-3 flex items-center justify-between">
                <div>
                    <Link href="/" className="text-lg font-semibold underline-offset-4 hover:underline">
                        <span className="text-purple-300">MyStore</span>
                    </Link>
                </div>

                <div className="flex items-center gap-4">
                    <Link href="/cart" className="text-sm text-purple-200 hover:underline">Cart</Link>

                    {session?.user ? (
                        <button
                            onClick={() => signOut({ callbackUrl: "/" })}
                            className="text-sm bg-transparent border border-white/10 px-3 py-1 rounded text-sm hover:bg-white/5"
                        >
                            Sign out
                        </button>
                    ) : (
                        <Link href="/auth/signin" className="text-sm text-purple-200 hover:underline">Sign in</Link>
                    )}
                </div>
            </nav>
        </header>
    )
}
