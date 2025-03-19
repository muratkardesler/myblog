import Link from 'next/link';
import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { User } from '@/lib/types';

interface HeaderProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (isOpen: boolean) => void;
}

export default function Header({ mobileMenuOpen, setMobileMenuOpen }: HeaderProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeRoute, setActiveRoute] = useState('/');
  const supabase = createClientComponentClient();

  useEffect(() => {
    // Komponent mount durumunu takip et
    let isMounted = true;
    let debounceTimer: NodeJS.Timeout | null = null;

    // Otomatik kimlik doğrulama kontrolü fonksiyonu
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        // Debounce işlemiyle durumu güncelleme
        if (debounceTimer) clearTimeout(debounceTimer);
        
        debounceTimer = setTimeout(() => {
          if (isMounted) {
            setIsAuthenticated(!!session);
            
            if (session?.user) {
              // Kullanıcı bilgilerini al
              supabase
                .from('users')
                .select('*')
                .eq('id', session.user.id)
                .single()
                .then(({ data }) => {
                  if (isMounted && data) {
                    setUser(data as User);
                  }
                  setLoading(false);
                });
            } else {
              setUser(null);
              setLoading(false);
            }
          }
        }, 200); // 200ms gecikme ile güncelle, art arda istekleri önle
      } catch (error) {
        console.error('Oturum kontrolü hatası:', error);
        if (isMounted) {
          setIsAuthenticated(false);
          setUser(null);
          setLoading(false);
        }
      }
    };

    checkAuth();
    
    // Event listener için referans
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAuth();
    });

    // Temizleme fonksiyonu
    return () => {
      isMounted = false;
      if (debounceTimer) clearTimeout(debounceTimer);
      subscription.unsubscribe();
    };
  }, [supabase]);

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
            
            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  <div className="text-gray-300">
                    <span className="text-purple-400 font-medium">Hoş geldiniz, </span> 
                    {user?.full_name || ''}
                  </div>
                  <Link 
                    href="/profile" 
                    className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-4 py-1.5 rounded-xl hover:bg-purple-500/20 transition-colors"
                  >
                    <i className="ri-user-line mr-2"></i>
                    Profilim
                  </Link>
                </div>
              ) : (
                <>
                  <Link 
                    href="/auth/login" 
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Giriş
                  </Link>
                  <Link 
                    href="/auth/register" 
                    className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-4 py-1.5 rounded-xl hover:bg-purple-500/20 transition-colors"
                  >
                    Üye Ol
                  </Link>
                </>
              )}
            </div>
            
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
          
          {isAuthenticated ? (
            <>
              <div className="text-gray-300 py-2">
                <span className="text-purple-400 font-medium">Hoş geldiniz, </span> 
                {user?.full_name || ''}
              </div>
              <Link 
                href="/profile" 
                className="text-purple-400 hover:text-primary transition-colors py-2"
              >
                <i className="ri-user-line mr-2"></i>
                Profilim
              </Link>
            </>
          ) : (
            <>
              <Link 
                href="/auth/login" 
                className="text-gray-300 hover:text-primary transition-colors py-2"
              >
                Giriş
              </Link>
              <Link 
                href="/auth/register" 
                className="text-purple-400 hover:text-primary transition-colors py-2"
              >
                Üye Ol
              </Link>
            </>
          )}
        </nav>
      </div>
    </>
  );
} 