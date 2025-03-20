import Link from 'next/link';
import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter, usePathname } from 'next/navigation';
import { User } from '@/lib/types';
import { getCurrentUser } from '@/lib/supabase';
import toast from 'react-hot-toast';

interface HeaderProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (isOpen: boolean) => void;
}

export default function Header({ mobileMenuOpen, setMobileMenuOpen }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    // Komponent mount durumunu takip et
    let isMounted = true;
    
    // Oturum kontrolü için interval süresini uzatalım (10sn'den 30sn'ye)
    const authCheckInterval = setInterval(checkAuth, 30000);
    
    // Otomatik kimlik doğrulama kontrolü fonksiyonu
    async function checkAuth() {
      try {
        // Gerçekten gerekli olmadıkça log yazdırmayalım
        // console.log("Header oturum kontrolü başladı");

        // getCurrentUser fonksiyonunu kullanarak daha güvenilir bir kontrol yap
        const { success, profile } = await getCurrentUser();
        
        // console.log("Header oturum durumu:", success ? "Oturum var" : "Oturum yok");
        
        if (isMounted) {
          // Durumda bir değişiklik varsa state'i güncelle
          if (isAuthenticated !== success) {
            setIsAuthenticated(success);
          }
          
          if (success && profile) {
            // Kullanıcı bilgisini güncelle
            setUser(profile as User);
          } else if (user !== null) {
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Oturum kontrolü hatası:', error);
        if (isMounted && isAuthenticated) {
          setIsAuthenticated(false);
          setUser(null);
        }
      }
    }

    // İlk yüklenmede bir kez kontrol et ve sonra intervale bırak
    checkAuth();
    
    // Oturum değişikliklerini dinle
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Gerçekten gerekli olmadıkça log yazdırmayalım
      // console.log("Oturum durumu değişti, event:", event);
      
      // Sadece kullanıcı gerçekten yeni giriş yaptığında bildirimi göster
      if (event === 'SIGNED_IN' && session?.user?.aud === 'authenticated') {
        // Sayfayı yeniden yüklediyse veya sayfa ilk yüklendiğinde bildirimi gösterme
        const lastSignInTime = window.localStorage.getItem('last_sign_in_time');
        const currentTime = new Date().getTime();
        
        // Son giriş zamanı kontrolü - 10 sn içinde tekrar bildirim gösterme
        if (!lastSignInTime || (currentTime - parseInt(lastSignInTime)) > 10000) {
          // Son giriş zamanını kaydet
          window.localStorage.setItem('last_sign_in_time', currentTime.toString());
          
          toast.custom(
            (t) => (
              <div
                className={`${
                  t.visible ? 'animate-enter' : 'animate-leave'
                } max-w-md w-full bg-gradient-to-br from-green-900/90 to-green-800/90 backdrop-blur-md shadow-lg rounded-xl pointer-events-auto flex border border-green-500/30`}
              >
                <div className="flex-1 w-0 p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 pt-0.5">
                      <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                        <i className="ri-check-line text-xl text-green-400"></i>
                      </div>
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-white">
                        Giriş Başarılı
                      </p>
                      <p className="mt-1 text-sm text-gray-300">
                        Hoş geldiniz! Başarıyla giriş yaptınız.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex border-l border-green-500/30">
                  <button
                    onClick={() => toast.dismiss(t.id)}
                    className="w-full border border-transparent rounded-none rounded-r-xl p-4 flex items-center justify-center text-sm font-medium text-green-300 hover:text-white focus:outline-none"
                  >
                    <i className="ri-close-line text-lg"></i>
                  </button>
                </div>
              </div>
            ),
            { duration: 3000 }
          );
        }
      }
      
      checkAuth();
    });

    // Temizleme fonksiyonu
    return () => {
      isMounted = false;
      clearInterval(authCheckInterval);
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      console.log("Çıkış işlemi başlatıldı");
      
      // Önce local storage'daki verileri temizleyelim
      localStorage.removeItem('supabase.auth.token');
      
      // Supabase oturumunu sonlandır
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }

      // Çıkış başarılı olduğunda
      console.log("Çıkış başarılı");
      
      // Modern bildirim
      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? 'animate-enter' : 'animate-leave'
            } max-w-md w-full bg-gradient-to-br from-blue-900/90 to-indigo-800/90 backdrop-blur-md shadow-lg rounded-xl pointer-events-auto flex border border-blue-500/30`}
          >
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <i className="ri-logout-box-line text-xl text-blue-400"></i>
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-white">
                    Çıkış Başarılı
                  </p>
                  <p className="mt-1 text-sm text-gray-300">
                    Oturumunuz güvenli bir şekilde sonlandırıldı.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex border-l border-blue-500/30">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="w-full border border-transparent rounded-none rounded-r-xl p-4 flex items-center justify-center text-sm font-medium text-blue-300 hover:text-white focus:outline-none"
              >
                <i className="ri-close-line text-lg"></i>
              </button>
            </div>
          </div>
        ),
        { duration: 3000 }
      );
      
      // Durumu güncelle
      setIsAuthenticated(false);
      setUser(null);
      
      // Sayfayı yenile ve anasayfaya yönlendir
      router.refresh();
      router.push('/');
    } catch (error) {
      console.error('Çıkış hatası:', error);
      
      // Hata bildirimi
      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? 'animate-enter' : 'animate-leave'
            } max-w-md w-full bg-gradient-to-br from-red-900/90 to-rose-800/90 backdrop-blur-md shadow-lg rounded-xl pointer-events-auto flex border border-red-500/30`}
          >
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center">
                    <i className="ri-error-warning-line text-xl text-red-400"></i>
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-white">
                    Hata Oluştu
                  </p>
                  <p className="mt-1 text-sm text-gray-300">
                    Çıkış yapılırken bir sorun oluştu. Lütfen tekrar deneyin.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex border-l border-red-500/30">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="w-full border border-transparent rounded-none rounded-r-xl p-4 flex items-center justify-center text-sm font-medium text-red-300 hover:text-white focus:outline-none"
              >
                <i className="ri-close-line text-lg"></i>
              </button>
            </div>
          </div>
        ),
        { duration: 4000 }
      );
    } finally {
      setIsLoggingOut(false);
    }
  };

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
              <Link href="/" className={`${pathname === '/' ? 'text-purple-400' : 'text-gray-300'} hover:text-primary transition-colors`}>Anasayfa</Link>
              <Link href="/about" className={`${pathname === '/about' ? 'text-purple-400' : 'text-gray-300'} hover:text-primary transition-colors`}>Hakkımda</Link>
              <Link href="/blog" className={`${pathname === '/blog' ? 'text-purple-400' : 'text-gray-300'} hover:text-primary transition-colors`}>Blog</Link>
              <Link href="/contact" className={`${pathname === '/contact' ? 'text-purple-400' : 'text-gray-300'} hover:text-primary transition-colors`}>İletişim</Link>
            </nav>
            
            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated && user ? (
                <div className="flex items-center space-x-3">
                  <div className="text-gray-300">
                    <span className="text-purple-400 font-medium">Hoş geldiniz, </span> 
                    {user?.full_name || ''}
                  </div>
                  <Link 
                    href="/profile" 
                    className={`${pathname === '/profile' ? 'bg-purple-500/20' : 'bg-purple-500/10'} text-purple-400 border border-purple-500/20 px-4 py-1.5 rounded-xl hover:bg-purple-500/20 transition-colors`}
                  >
                    <i className="ri-user-line mr-2"></i>
                    Profilim
                  </Link>
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="bg-red-500/10 text-red-400 border border-red-500/20 px-4 py-1.5 rounded-xl hover:bg-red-500/20 transition-colors disabled:opacity-70"
                  >
                    {isLoggingOut ? (
                      <span className="flex items-center">
                        <i className="ri-loader-4-line animate-spin mr-1"></i>
                        Çıkış
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <i className="ri-logout-box-line mr-2"></i>
                        Çıkış
                      </span>
                    )}
                  </button>
                </div>
              ) : (
                <>
                  <Link 
                    href="/auth/login" 
                    className={`${pathname === '/auth/login' ? 'text-purple-400' : 'text-gray-300'} hover:text-white transition-colors`}
                    prefetch={false}
                  >
                    Giriş
                  </Link>
                  <Link 
                    href="/auth/register" 
                    className={`${pathname === '/auth/register' ? 'bg-purple-500/20' : 'bg-purple-500/10'} text-purple-400 border border-purple-500/20 px-4 py-1.5 rounded-xl hover:bg-purple-500/20 transition-colors`}
                    prefetch={false}
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
          <Link href="/" className={`${pathname === '/' ? 'text-purple-400' : 'text-gray-300'} hover:text-primary transition-colors py-2`}>Anasayfa</Link>
          <Link href="/about" className={`${pathname === '/about' ? 'text-purple-400' : 'text-gray-300'} hover:text-primary transition-colors py-2`}>Hakkımda</Link>
          <Link href="/blog" className={`${pathname === '/blog' ? 'text-purple-400' : 'text-gray-300'} hover:text-primary transition-colors py-2`}>Blog</Link>
          <Link href="/contact" className={`${pathname === '/contact' ? 'text-purple-400' : 'text-gray-300'} hover:text-primary transition-colors py-2`}>İletişim</Link>
          
          {isAuthenticated && user ? (
            <>
              <div className="text-gray-300 py-2">
                <span className="text-purple-400 font-medium">Hoş geldiniz, </span> 
                {user?.full_name || ''}
              </div>
              <Link 
                href="/profile" 
                className={`${pathname === '/profile' ? 'text-purple-500' : 'text-purple-400'} hover:text-primary transition-colors py-2`}
              >
                <i className="ri-user-line mr-2"></i>
                Profilim
              </Link>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="text-red-400 hover:text-red-300 transition-colors py-2 text-left disabled:opacity-70"
              >
                {isLoggingOut ? (
                  <span className="flex items-center">
                    <i className="ri-loader-4-line animate-spin mr-1"></i>
                    Çıkış yapılıyor...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <i className="ri-logout-box-line mr-2"></i>
                    Çıkış Yap
                  </span>
                )}
              </button>
            </>
          ) : (
            <>
              <Link 
                href="/auth/login" 
                className={`${pathname === '/auth/login' ? 'text-purple-400' : 'text-gray-300'} hover:text-primary transition-colors py-2`}
                prefetch={false}
              >
                Giriş
              </Link>
              <Link 
                href="/auth/register" 
                className={`${pathname === '/auth/register' ? 'text-purple-500' : 'text-purple-400'} hover:text-primary transition-colors py-2`}
                prefetch={false}
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