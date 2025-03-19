import Link from 'next/link';
import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface HeaderProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (isOpen: boolean) => void;
}

export default function Header({ mobileMenuOpen, setMobileMenuOpen }: HeaderProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setIsLoggedIn(!!data.session);
    };
    
    checkAuth();
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session);
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase.auth]);

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-gray-900/90 backdrop-blur-lg shadow-lg shadow-purple-900/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-white">MyBlog</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/" className="text-gray-300 hover:text-white px-3 py-2 rounded-lg transition-colors">
                Anasayfa
              </Link>
              <Link href="/blog" className="text-gray-300 hover:text-white px-3 py-2 rounded-lg transition-colors">
                Blog
              </Link>
              <Link href="/about" className="text-gray-300 hover:text-white px-3 py-2 rounded-lg transition-colors">
                Hakkımda
              </Link>
              <Link href="/contact" className="text-gray-300 hover:text-white px-3 py-2 rounded-lg transition-colors">
                İletişim
              </Link>
            </nav>
            
            <div className="hidden md:flex items-center space-x-2">
              {isLoggedIn ? (
                <Link href="/profile" className="flex items-center bg-purple-500/10 text-purple-400 border border-purple-500/20 px-4 py-1.5 rounded-xl hover:bg-purple-500/20 transition-colors">
                  <i className="ri-user-line mr-2"></i>
                  Profilim
                </Link>
              ) : (
                <>
                  <Link href="/auth/login" className="text-gray-300 hover:text-white px-3 py-1.5 rounded-lg transition-colors">
                    Giriş
                  </Link>
                  <Link href="/auth/register" className="flex items-center bg-purple-500/10 text-purple-400 border border-purple-500/20 px-4 py-1.5 rounded-xl hover:bg-purple-500/20 transition-colors">
                    Üye Ol
                  </Link>
                </>
              )}
            </div>
            
            <button
              type="button"
              className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white focus:outline-none"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Menü</span>
              {mobileMenuOpen ? (
                <i className="ri-close-line text-2xl"></i>
              ) : (
                <i className="ri-menu-line text-2xl"></i>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobil Menü */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-gray-800">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link 
              href="/" 
              className="block px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Anasayfa
            </Link>
            <Link 
              href="/blog" 
              className="block px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Blog
            </Link>
            <Link 
              href="/about" 
              className="block px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Hakkımda
            </Link>
            <Link 
              href="/contact" 
              className="block px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              İletişim
            </Link>
            
            {isLoggedIn ? (
              <Link 
                href="/profile" 
                className="block px-3 py-2 text-base font-medium text-purple-400 hover:bg-gray-700 hover:text-white rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <i className="ri-user-line mr-2"></i>
                Profilim
              </Link>
            ) : (
              <>
                <Link 
                  href="/auth/login" 
                  className="block px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Giriş
                </Link>
                <Link 
                  href="/auth/register" 
                  className="block px-3 py-2 text-base font-medium text-purple-400 hover:bg-gray-700 hover:text-white rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Üye Ol
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
} 