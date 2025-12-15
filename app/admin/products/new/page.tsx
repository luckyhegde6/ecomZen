import React from 'react'
import ProductForm from '@/components/admin/ProductForm'
import BackButton from '@/components/admin/BackButton' // We will create this

export default function NewProductPage() {
    return (
        <div className="max-w-4xl mx-auto py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Create Product</h1>
                    <p className="mt-2 text-sm text-gray-500">Add a new product to your inventory.</p>
                </div>
                <BackButton />
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
                <ProductForm />
            </div>
        </div>
    )
}
