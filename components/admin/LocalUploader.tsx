"use client"
import React, { useState } from 'react'

export default function LocalUploader({ onUploaded }: { onUploaded?: (files: { url: string }[]) => void }) {
    const [uploading, setUploading] = useState(false)
    const [previewUrls, setPreviewUrls] = useState<string[]>([])

    async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
        const files = e.target.files
        if (!files || files.length === 0) return
        setUploading(true)

        const form = new FormData()
        for (let i = 0; i < files.length; i++) form.append('file', files[i])

        try {
            const res = await fetch('/api/admin/upload-local', { method: 'POST', body: form })
            const json = await res.json()
            if (!res.ok) {
                console.error('Upload failed', json)
                alert('Upload failed')
                return
            }
            const filesData = json.files as { url: string }[]
            setPreviewUrls(filesData.map(f => f.url))
            if (onUploaded) onUploaded(filesData)
        } catch (err) {
            console.error('Upload error', err)
            alert('Upload error')
        } finally {
            setUploading(false)
            e.currentTarget.value = ''
        }
    }

    return (
        <div className="w-full">
            <label
                className={`
                    relative flex flex-col items-center justify-center w-full h-32 
                    border-2 border-dashed border-gray-300 rounded-xl cursor-pointer 
                    bg-gray-50 hover:bg-gray-100 hover:border-black/30 transition-all
                    ${uploading ? 'opacity-50 pointer-events-none' : ''}
                `}
            >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {uploading ? (
                        <svg className="animate-spin h-8 w-8 text-gray-400 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        <svg className="w-8 h-8 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                    )}
                    <p className="mb-1 text-sm text-gray-500 font-medium">
                        {uploading ? 'Uploading files...' : <span className="font-semibold text-gray-700">Click to upload images</span>}
                    </p>
                    <p className="text-xs text-gray-400">SVG, PNG, JPG or GIF (MAX. 5MB)</p>
                </div>
                <input type="file" accept="image/*" multiple onChange={handleFiles} className="hidden" />
            </label>
        </div>
    )
}
