import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Link from 'next/link'
import { FaCode } from 'react-icons/fa'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Murat Kardeşler Blog",
  description: "Kişisel blog sayfam",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <div className="min-h-screen bg-gray-50">
          <header className="bg-white border-b shadow-sm sticky top-0 z-50">
            <nav className="max-w-6xl mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <Link 
                  href="/" 
                  className="flex items-center space-x-2 text-2xl font-bold text-gray-800 hover:text-blue-600 transition-colors"
                >
                  <FaCode className="text-blue-600" size={28} />
                  <span>MK</span>
                </Link>
                <div className="flex gap-8 text-gray-600">
                  <Link 
                    href="/" 
                    className="hover:text-blue-600 transition-colors py-2 border-b-2 border-transparent hover:border-blue-600"
                  >
                    Ana Sayfa
                  </Link>
                  <Link 
                    href="/blog" 
                    className="hover:text-blue-600 transition-colors py-2 border-b-2 border-transparent hover:border-blue-600"
                  >
                    Blog
                  </Link>
                  <Link 
                    href="/about" 
                    className="hover:text-blue-600 transition-colors py-2 border-b-2 border-transparent hover:border-blue-600"
                  >
                    Hakkımda
                  </Link>
                </div>
              </div>
            </nav>
          </header>
          <main className="bg-gray-50">
            {children}
          </main>
          <footer className="bg-white border-t py-8 mt-16">
            <div className="max-w-6xl mx-auto px-4 text-center text-gray-600">
              <p>© 2024 Murat Kardeşler. Tüm hakları saklıdır.</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
