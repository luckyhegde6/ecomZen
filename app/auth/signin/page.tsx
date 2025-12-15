"use client"

import { useEffect, useState } from "react"
import { signIn } from "next-auth/react"

export default function SignInPage() {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null // ← critical

    return (
        <main className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4">
            <div className="w-full max-w-md rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <h1 className="mb-6 text-xl font-semibold">Sign in</h1>

                <form
                    onSubmit={async e => {
                        e.preventDefault()
                        const form = new FormData(e.currentTarget)
                        await signIn("credentials", {
                            email: form.get("email"),
                            password: form.get("password"),
                            callbackUrl: "/",
                        })
                    }}
                    className="space-y-4"
                >
                    <label className="block">
                        <span className="text-sm text-white/80">Email</span>
                        <input
                            name="email"
                            type="email"
                            required
                            autoComplete="email"
                            className="mt-1 w-full rounded border border-white/10 bg-transparent px-3 py-2"
                        />
                    </label>

                    <label className="block">
                        <span className="text-sm text-white/80">Password</span>
                        <input
                            name="password"
                            type="password"
                            required
                            autoComplete="current-password"
                            className="mt-1 w-full rounded border border-white/10 bg-transparent px-3 py-2"
                        />
                    </label>

                    <button className="w-full rounded bg-indigo-600 py-2 font-medium hover:bg-indigo-500">
                        Sign in
                    </button>
                </form>
            </div>
        </main>
    )
}
