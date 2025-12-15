import React from 'react'

import OrdersTable from '@/components/admin/OrdersTable'

export default function AdminOrdersPage() {
    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Orders</h1>
            <OrdersTable />
        </div>
    )
}
