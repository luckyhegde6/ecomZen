import '../styles/globals.css'
import React from 'react'
import Providers from '../components/Providers'
import Header from '@/components/Header'

export const metadata = {
  title: 'MyStore',
  description: 'Ecommerce starter',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#020617] text-gray-100">
        <Providers>
          <Header />
          <main className="mx-auto max-w-7xl px-4 py-6">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  )
}
