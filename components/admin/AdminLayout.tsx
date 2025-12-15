import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/nextauth"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session || (session.user as any)?.role !== "admin") {
    redirect("/")
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white shrink-0 hidden md:block">
        <div className="p-6">
          <h2 className="text-xl font-bold tracking-wide text-gray-100 mb-6">Admin Portal</h2>
          <nav className="space-y-1">
            <Link
              href="/admin"
              className="block px-4 py-2.5 text-sm font-medium text-gray-300 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/admin/products"
              className="block px-4 py-2.5 text-sm font-medium text-gray-300 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
            >
              Products
            </Link>
            <Link
              href="/admin/orders"
              className="block px-4 py-2.5 text-sm font-medium text-gray-300 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
            >
              Orders
            </Link>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden">
        <div className="h-full p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
