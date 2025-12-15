"use client"
import React from 'react'
import { useRouter } from 'next/navigation'

export default function BackButton() {
    const router = useRouter()
    return (
        <button
            onClick={() => router.back()}
            className="text-sm text-gray-600 hover:text-gray-900 font-medium"
        >
            ← Back
        </button>
    )
}
