// components/SignOutButton.tsx
"use client"

import { signOut } from "next-auth/react"

export default function SignOutButton({ redirectUrl = "/" }: { redirectUrl?: string }) {
    return (
        <button
            onClick={() => signOut({ callbackUrl: redirectUrl })}
            className="px-3 py-1 rounded bg-gray-800 text-white text-sm"
        >
            Sign out
        </button>
    )
}
