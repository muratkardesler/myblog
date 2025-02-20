import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-gray-900 to-gray-800 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-purple-400 text-white font-bold text-xl">
                M
              </div>
              <span className="text-xl font-semibold bg-gradient-to-r from-purple-400 to-purple-600 text-transparent bg-clip-text">
                Murat Blog
              </span>
            </Link>
            <p className="mt-4 text-gray-600">Teknoloji, tasarım ve daha fazlası hakkında yazılar.</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-100 mb-4">Hızlı Bağlantılar</h4>
            <ul className="space-y-2">
              <li><Link href="/" className="text-gray-600 hover:text-primary">Anasayfa</Link></li>
              <li><Link href="/about" className="text-gray-600 hover:text-primary">Hakkımda</Link></li>
              <li><Link href="/blog" className="text-gray-600 hover:text-primary">Blog</Link></li>
              <li><Link href="/contact" className="text-gray-600 hover:text-primary">İletişim</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-100 mb-4">Sosyal Medya</h4>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 border border-gray-700 hover:border-primary transition-colors">
                <i className="ri-twitter-x-line"></i>
              </a>
              <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 border border-gray-700 hover:border-primary transition-colors">
                <i className="ri-linkedin-line"></i>
              </a>
              <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 border border-gray-700 hover:border-primary transition-colors">
                <i className="ri-github-line"></i>
              </a>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-100 mb-4">Bülten</h4>
            <div className="flex">
              <input type="email" placeholder="E-posta adresiniz" className="flex-1 px-4 py-2 border border-gray-700 bg-gray-800 text-gray-100 rounded-l-button focus:outline-none focus:border-primary" />
              <button className="!rounded-r-button !rounded-l-none bg-primary text-white px-6 py-2 hover:bg-blue-600 transition-colors whitespace-nowrap">
                Abone Ol
              </button>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400">© 2025 Murat Blog. Tüm hakları saklıdır.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-600 hover:text-primary">Gizlilik Politikası</a>
            <a href="#" className="text-gray-600 hover:text-primary">Kullanım Koşulları</a>
          </div>
        </div>
      </div>
    </footer>
  );
} 