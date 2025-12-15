// src/components/ui/ConfirmModal.tsx
import React from 'react'

type Props = {
    title?: string
    message?: string
    open: boolean
    onConfirm: () => void
    onCancel: () => void
    confirmLabel?: string
    cancelLabel?: string
}

export default function ConfirmModal({
    title = 'Confirm',
    message = 'Are you sure?',
    open,
    onConfirm,
    onCancel,
    confirmLabel = 'Yes, delete',
    cancelLabel = 'Cancel'
}: Props) {
    if (!open) return null
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-full max-w-lg bg-white rounded shadow p-6">
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="text-sm text-gray-600 mt-2">{message}</p>
                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={onCancel} className="px-4 py-2 border rounded bg-white">{cancelLabel}</button>
                    <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded">{confirmLabel}</button>
                </div>
            </div>
        </div>
    )
}
