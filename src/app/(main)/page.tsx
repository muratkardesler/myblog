import Link from 'next/link'
import { FaGithub, FaLinkedin } from 'react-icons/fa'

export default function HomePage() {
  return (
    <div className="flex-1">
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-5xl font-serif">
                Merhaba, Ben Murat Kardeşler.
              </h1>
              <p className="text-xl lg:text-2xl text-gray-600">
                Yazılım geliştirici, blog yazarı ve teknoloji meraklısıyım.
              </p>
              <div className="flex space-x-4 mt-6">
                <a
                  href="https://www.linkedin.com/in/murat-karde%C5%9Fler-0aa63a155/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-600 hover:text-blue-600 transition-all group"
                >
                  <FaLinkedin size={28} className="text-[#0A66C2] group-hover:scale-110 transition-transform" />
                  <span className="font-medium">LinkedIn</span>
                </a>
                <a
                  href="https://github.com/muratkardesler"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-lg hover:border-gray-900 hover:text-gray-900 transition-all group"
                >
                  <FaGithub size={28} className="group-hover:scale-110 transition-transform" />
                  <span className="font-medium">GitHub</span>
                </a>
              </div>
            </div>
          </div>

          <div className="lg:pl-12">
            <div className="space-y-8">
              <h2 className="text-3xl lg:text-4xl font-serif">
                Neler Yapıyorum?
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Web teknolojileri üzerine çalışıyor, öğrendiklerimi blog yazıları 
                aracılığıyla paylaşıyorum. Modern web teknolojileri, yazılım 
                mimarisi ve kullanıcı deneyimi konularında sürekli kendimi 
                geliştiriyorum.
              </p>
              <Link
                href="/about"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Daha fazla bilgi
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Blog Posts Section */}
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-serif">Son Yazılarım</h2>
            <Link 
              href="/blog" 
              className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 font-medium"
            >
              <span>Tüm yazılar</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Featured Blog Post Card */}
            <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-1 border border-gray-100 col-span-full lg:col-span-2">
              <div className="p-6">
                <div className="flex items-center space-x-2 text-sm text-gray-500 mb-3">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">Yeni</span>
                  <span>15 Şubat 2024</span>
                </div>
                <h3 className="text-2xl font-semibold mb-3">
                  <Link href="/blog/nextjs-ile-modern-web-gelistirme" className="hover:text-blue-600">
                    Next.js ile Modern Web Geliştirme
                  </Link>
                </h3>
                <p className="text-gray-600 mb-4 text-lg">
                  Next.js&apos;in sunduğu özellikler, performans optimizasyonları ve modern web uygulamaları geliştirme sürecindeki avantajları.
                </p>
                <Link 
                  href="/blog/nextjs-ile-modern-web-gelistirme" 
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                >
                  <span>Devamını oku</span>
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </article>

            {/* Regular Blog Post Cards */}
            <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-1 border border-gray-100">
              <div className="p-6">
                <div className="text-sm text-gray-500 mb-3">10 Şubat 2024</div>
                <h3 className="text-xl font-semibold mb-3">
                  <Link href="/blog/typescript-best-practices" className="hover:text-blue-600">
                    TypeScript Best Practices
                  </Link>
                </h3>
                <p className="text-gray-600 mb-4">
                  TypeScript ile daha güvenli ve ölçeklenebilir kod yazmanın yolları, tip sisteminin etkin kullanımı ve yaygın hatalardan kaçınma.
                </p>
                <Link 
                  href="/blog/typescript-best-practices" 
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                >
                  <span>Devamını oku</span>
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </article>

            <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-1 border border-gray-100">
              <div className="p-6">
                <div className="text-sm text-gray-500 mb-3">5 Şubat 2024</div>
                <h3 className="text-xl font-semibold mb-3">
                  <Link href="/blog/supabase-ile-backend-gelistirme" className="hover:text-blue-600">
                    Supabase ile Backend Geliştirme
                  </Link>
                </h3>
                <p className="text-gray-600 mb-4">
                  Supabase&apos;in sunduğu özellikler, veritabanı yönetimi, gerçek zamanlı veri ve authentication sistemlerinin implementasyonu.
                </p>
                <Link 
                  href="/blog/supabase-ile-backend-gelistirme" 
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                >
                  <span>Devamını oku</span>
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </article>
          </div>
        </div>
      </div>
    </div>
  )
}
