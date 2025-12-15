'use client'

import React, { useEffect, useState } from 'react'
import axios from 'axios'

interface Order {
    id: string
    total: number
    status: string
    createdAt: string
    user: {
        name: string | null
        email: string
    } | null
}

export default function OrdersTable() {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        fetchOrders()
    }, [])

    const fetchOrders = async () => {
        try {
            const { data } = await axios.get('/api/admin/orders')
            setOrders(data)
        } catch (err) {
            setError('Failed to load orders')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <div>Loading orders...</div>
    if (error) return <div className="text-red-500">{error}</div>

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
                <thead>
                    <tr className="bg-gray-50 border-b">
                        <th className="py-2 px-4 text-left text-sm font-semibold text-gray-600">Order ID</th>
                        <th className="py-2 px-4 text-left text-sm font-semibold text-gray-600">Customer</th>
                        <th className="py-2 px-4 text-left text-sm font-semibold text-gray-600">Total</th>
                        <th className="py-2 px-4 text-left text-sm font-semibold text-gray-600">Status</th>
                        <th className="py-2 px-4 text-left text-sm font-semibold text-gray-600">Date</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="text-center py-4 text-gray-500">
                                No orders found.
                            </td>
                        </tr>
                    ) : (
                        orders.map((order) => (
                            <tr key={order.id} className="border-b hover:bg-gray-50">
                                <td className="py-2 px-4 text-sm font-mono text-gray-700">{order.id}</td>
                                <td className="py-2 px-4 text-sm text-gray-700">
                                    {order.user?.email || 'Guest'}
                                    {order.user?.name && <span className="text-gray-500 text-xs block">{order.user.name}</span>}
                                </td>
                                <td className="py-2 px-4 text-sm text-gray-700">₹{order.total}</td>
                                <td className="py-2 px-4 text-sm">
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs font-medium ${order.status === 'completed'
                                                ? 'bg-green-100 text-green-800'
                                                : order.status === 'pending'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}
                                    >
                                        {order.status}
                                    </span>
                                </td>
                                <td className="py-2 px-4 text-sm text-gray-500">
                                    {new Date(order.createdAt).toLocaleDateString()}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    )
}
