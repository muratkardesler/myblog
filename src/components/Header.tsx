import Link from 'next/link';

interface HeaderProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export default function Header({ mobileMenuOpen, setMobileMenuOpen }: HeaderProps) {
  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-gray-900/80 backdrop-blur-md z-50 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-purple-400 text-white font-bold text-xl">
                M
              </div>
              <span className="text-xl font-semibold bg-gradient-to-r from-purple-400 to-purple-600 text-transparent bg-clip-text">
                Murat Blog
              </span>
            </Link>
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="text-gray-300 hover:text-primary transition-colors">Anasayfa</Link>
              <Link href="/about" className="text-gray-300 hover:text-primary transition-colors">Hakkımda</Link>
              <Link href="/blog" className="text-gray-300 hover:text-primary transition-colors">Blog</Link>
              <Link href="/contact" className="text-gray-300 hover:text-primary transition-colors">İletişim</Link>
            </nav>
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-10 h-10 flex items-center justify-center"
            >
              <i className="ri-menu-line text-xl"></i>
            </button>
          </div>
        </div>
      </header>
      <div className={`fixed inset-0 bg-gray-900 z-40 md:hidden pt-16 ${mobileMenuOpen ? '' : 'hidden'}`}>
        <nav className="flex flex-col space-y-4 p-4">
          <Link href="/" className="text-gray-300 hover:text-primary transition-colors py-2">Anasayfa</Link>
          <Link href="/about" className="text-gray-300 hover:text-primary transition-colors py-2">Hakkımda</Link>
          <Link href="/blog" className="text-gray-300 hover:text-primary transition-colors py-2">Blog</Link>
          <Link href="/contact" className="text-gray-300 hover:text-primary transition-colors py-2">İletişim</Link>
        </nav>
      </div>
    </>
  );
} 