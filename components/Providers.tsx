// app/components/Providers.tsx
'use client'
import React from 'react'
import { SessionProvider } from 'next-auth/react'

export default function Providers({ children }: { children: React.ReactNode }) {
    // You can optionally pass `session={session}` here if you fetch session server-side
    // For now, let SessionProvider fetch session on the client.
    return (
        <SessionProvider>
            {children}
        </SessionProvider>
    )
}
