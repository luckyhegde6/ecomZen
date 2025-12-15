"use client"
import React, { useState } from 'react'

export default function CleanupPage() {
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')

    async function runCleanup() {
        setLoading(true)
        setMessage('')
        try {
            const res = await fetch('/api/admin/cleanup', { method: 'POST' })
            const json = await res.json()
            if (res.ok) {
                setMessage(`Success: ${json.message || 'Cleanup complete'}`)
            } else {
                setMessage(`Error: ${json.error || 'Failed'}`)
            }
        } catch (err) {
            setMessage('Error running cleanup')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">System Cleanup</h1>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <p className="text-gray-600 mb-6">
                    This utility scans for unused images in the upload directory that are not referenced by any product in the database and removes them to free up space.
                </p>

                <button
                    onClick={runCleanup}
                    disabled={loading}
                    className="px-6 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                    {loading ? 'Cleaning...' : 'Run Cleanup Task'}
                </button>

                {message && (
                    <div className={`mt-6 p-4 rounded-lg text-sm ${message.startsWith('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                        {message}
                    </div>
                )}
            </div>
        </div>
    )
}
