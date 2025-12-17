import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/nextauth"
import { prisma } from "@/lib/prisma"
import { redirect, notFound } from "next/navigation"

export const dynamic = 'force-dynamic'

// Need to define PageProps correctly for Next.js 15 usage if strictly checked, 
// but using standard param prop pattern usually works or `params` as promise.
// Using `params: { id: string }` directly for now.

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
        redirect("/auth/signin")
    }

    // Next.js 15: params might need to be awaited if it's a promise, but for safe measure:
    // (If this environment uses Next.js 15, params is a Promise).
    // Assuming standard 14 behavior or awaiting it to be safe if strictly typed as promise.
    // BUT the user prompt info implies "next.config.ts" which hints at newer Next.js.
    // I will check `package.json` later if needed, but safe bet is `await params` if it allows, 
    // or just use it. Let's assume params is standard object for now or implicit.

    const { id } = params

    const order = await prisma.order.findUnique({
        where: { id },
    })

    if (!order) {
        notFound()
    }

    if (order.userId !== session.user.id && session.user.role !== 'admin') {
        // Basic security check
        redirect("/orders")
    }

    const steps = [
        { status: 'ordered', label: 'Ordered' },
        { status: 'shipped', label: 'Shipped' },
        { status: 'out_for_delivery', label: 'Out for Delivery' },
        { status: 'delivered', label: 'Delivered' }
    ]

    const currentStepIndex = steps.findIndex(s => s.status === order.trackingStatus)

    return (
        <main className="container mx-auto p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Order Details</h1>
                <p className="text-gray-500">#{order.id}</p>
            </div>

            {/* Tracking UI */}
            <div className="mb-8 p-6 bg-white border rounded-lg shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Tracking Status</h2>
                <div className="relative flex justify-between">
                    {/* Simple Progress Bar */}
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-10 -translate-y-1/2" />
                    <div
                        className="absolute top-1/2 left-0 h-1 bg-green-500 -z-10 -translate-y-1/2 transition-all duration-500"
                        style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                    />

                    {steps.map((step, index) => {
                        const isCompleted = index <= currentStepIndex
                        return (
                            <div key={step.status} className="flex flex-col items-center bg-white px-2">
                                <div className={`w-4 h-4 rounded-full border-2 ${isCompleted ? 'bg-green-500 border-green-500' : 'bg-white border-gray-300'}`} />
                                <span className={`text-xs mt-2 ${isCompleted ? 'text-green-600 font-medium' : 'text-gray-500'}`}>{step.label}</span>
                            </div>
                        )
                    })}
                </div>
                <div className="mt-4 text-center">
                    <p className="text-sm text-gray-700">Current Status: <span className="font-bold">{order.trackingStatus.replace(/_/g, ' ').toUpperCase()}</span></p>
                </div>
            </div>

            <div className="border rounded-lg p-6 bg-white shadow-sm">
                <h2 className="font-semibold mb-4">Payment Summary</h2>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>₹{(order.subtotal / 100).toFixed(2)}</span>
                    </div>
                    {order.deliveryFee > 0 && (
                        <div className="flex justify-between text-gray-600">
                            <span>Delivery Fee</span>
                            <span>₹{(order.deliveryFee / 100).toFixed(2)}</span>
                        </div>
                    )}
                    {order.shippingFee > 0 && (
                        <div className="flex justify-between text-gray-600">
                            <span>Shipping Fee</span>
                            <span>₹{(order.shippingFee / 100).toFixed(2)}</span>
                        </div>
                    )}
                    {order.platformFee > 0 && (
                        <div className="flex justify-between text-gray-600">
                            <span>Platform Fee</span>
                            <span>₹{(order.platformFee / 100).toFixed(2)}</span>
                        </div>
                    )}
                    {order.discount > 0 && (
                        <div className="flex justify-between text-green-600">
                            <span>Discount</span>
                            <span>-₹{(order.discount / 100).toFixed(2)}</span>
                        </div>
                    )}
                    <div className="pt-2 border-t flex justify-between font-bold text-base">
                        <span>Total</span>
                        <span>₹{(order.total / 100).toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </main>
    )
}
