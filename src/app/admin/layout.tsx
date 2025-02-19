import { FiHome, FiLogOut } from 'react-icons/fi'
import Link from 'next/link'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Üst menü */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              {/* Logo */}
              <div className="flex-shrink-0 flex items-center">
                <Link href="/admin/dashboard" className="text-xl font-bold text-gray-900">
                  Admin Panel
                </Link>
              </div>
            </div>

            {/* Sağ taraftaki butonlar */}
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600"
                title="Siteye Git"
              >
                <FiHome className="w-5 h-5" />
              </Link>
              <Link
                href="/admin/logout"
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-red-600"
                title="Çıkış Yap"
              >
                <FiLogOut className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Ana içerik */}
      <main>
        {children}
      </main>

      {/* Alt bilgi */}
      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            © 2024 Admin Panel. Tüm hakları saklıdır.
          </p>
        </div>
      </footer>
    </div>
  )
} 