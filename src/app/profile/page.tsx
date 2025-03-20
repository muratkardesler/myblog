'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import toast from 'react-hot-toast';
import { User } from '@/lib/types';
import { getCurrentUser } from '@/lib/supabase';

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("Profil sayfası oturum kontrolü başladı");
        const { success, profile } = await getCurrentUser();

        if (!success || !profile) {
          console.log("Oturum bulunamadı, giriş sayfasına yönlendiriliyor");
          router.push('/auth/login');
          return;
        }

        console.log("Kullanıcı profili bulundu:", profile.full_name);
        setUser(profile as User);
        setAuthChecked(true);
        setLoading(false);
      } catch (error) {
        console.error('Profil verisi yüklenirken hata:', error);
        setLoading(false);
        router.push('/auth/login');
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      console.log("Profil sayfasından çıkış işlemi başlatıldı");
      
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
      
      // Sayfayı yenile ve anasayfaya yönlendir
      router.refresh();
      router.push('/');
    } catch (error) {
      console.error('Çıkış yaparken hata:', error);
      
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

  // Oturum kontrolü yapılana kadar yükleniyor göster
  if (!authChecked && loading) {
    return (
      <>
        <Header mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
        <main className="min-h-screen bg-gray-900 pt-20 pb-16">
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
      <main className="min-h-screen bg-gray-900 pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            ) : (
              <>
                <div className="mb-10 text-center">
                  <h1 className="text-3xl font-bold text-white mb-4">Profil Sayfası</h1>
                  <div className="bg-purple-500/10 p-6 rounded-xl border border-purple-500/20 mb-6">
                    <p className="text-purple-400 text-lg mb-2">Hoş geldiniz, <span className="font-semibold">{user?.full_name}</span></p>
                    <p className="text-gray-300 mb-6">Bu profil sayfası üzerinde çok yakında heyecan verici yeni özellikler olacak.</p>
                    <div className="max-w-xl mx-auto space-y-4">
                      <div className="bg-gray-700/50 p-4 rounded-lg">
                        <h3 className="text-white font-medium mb-1">Yakında Eklenecek Özellikler</h3>
                        <p className="text-gray-400">• Profil fotoğrafı yükleme ve düzenleme</p>
                        <p className="text-gray-400">• Profil bilgilerini güncelleme</p>
                        <p className="text-gray-400">• Favorilere eklediğiniz yazıları görüntüleme</p>
                        <p className="text-gray-400">• İstatistiklerinizi takip etme</p>
                      </div>
                      <div className="bg-purple-500/10 p-4 rounded-lg border border-purple-500/20">
                        <p className="text-gray-300 italic">
                          &ldquo;Geliştirmeler devam ediyor, çok yakında daha fazla özellikle karşınızda olacağız!&rdquo;
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full max-w-xs mx-auto py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl focus:outline-none transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isLoggingOut ? (
                      <span className="flex items-center justify-center">
                        <i className="ri-loader-4-line animate-spin mr-2"></i>
                        Çıkış yapılıyor...
                      </span>
                    ) : (
                      'Çıkış Yap'
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
} 