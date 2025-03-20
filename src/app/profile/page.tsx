'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient, getCurrentUser } from '@/lib/supabase';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPageReady, setIsPageReady] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        
        // Mevcut oturumu kontrol et
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          // Oturum yoksa giriş sayfasına yönlendir
          console.log("Oturum bulunamadı, giriş sayfasına yönlendiriliyor...");
          
          // Önce önbelleği temizleyelim
          await fetch('/api/auth/clear-cache', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          });
          
          router.push('/auth/login');
          return;
        }
        
        // Oturum varsa kullanıcı bilgilerini al
        const { success, user: authUser, profile, error } = await getCurrentUser();
        
        if (!success || !authUser) {
          console.error("Kullanıcı bilgisi alınamadı:", error?.message);
          
          // Oturum yenilemeyi dene
          const { success: refreshSuccess } = await supabase.auth.refreshSession();
          
          if (!refreshSuccess) {
            // Yenilemeden sonra hala başarısızsa çıkış yap ve giriş sayfasına yönlendir
            await supabase.auth.signOut();
            router.push('/auth/login');
            return;
          }
          
          // Bir kez daha kontrol et
          const secondCheck = await getCurrentUser();
          if (!secondCheck.success) {
            // Hala başarısızsa çıkış yap
            await supabase.auth.signOut();
            router.push('/auth/login');
            return;
          }
          
          // İkinci deneme başarılıysa kullanıcı bilgilerini ayarla
          setUser({
            ...secondCheck.user,
            ...secondCheck.profile
          });
        } else {
          // Başarılı ise kullanıcı bilgilerini ayarla
          setUser({
            ...authUser,
            ...profile
          });
        }
      } catch (error) {
        console.error("Profil sayfası yüklenirken hata:", error);
        
        // Hata durumunda güvenli bir şekilde çıkış yap
        await supabase.auth.signOut();
        toast.error("Oturumunuzda bir sorun oluştu. Lütfen tekrar giriş yapın.");
        router.push('/auth/login');
      } finally {
        setIsLoading(false);
        setIsPageReady(true);
      }
    };
    
    checkAuth();
    
    // Auth durum değişikliklerini dinle
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          router.push('/auth/login');
        } else if (event === 'TOKEN_REFRESHED') {
          // Token yenilendiğinde kullanıcı bilgilerini yeniden al
          const { success, user: refreshedUser, profile } = await getCurrentUser();
          if (success && refreshedUser) {
            setUser({
              ...refreshedUser,
              ...profile
            });
          }
        }
      }
    );
    
    // Cleanup
    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase.auth]);

  // Sayfa henüz hazır değilse yükleniyor göster
  if (!isPageReady || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-purple-500 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Yükleniyor...</span>
          </div>
          <p className="mt-4 text-gray-400">Profiliniz yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 pt-20">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8">
          <h1 className="text-2xl font-bold text-white mb-6">Profil Sayfası</h1>
          
          {user ? (
            <div className="space-y-6">
              <div className="flex flex-wrap gap-4 mb-6">
                <Link 
                  href="/profile"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Profil Bilgileri
                </Link>
                <Link 
                  href="/profile/work-logs"
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  İş Takibi
                </Link>
                <Link 
                  href="/profile/reports"
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Raporlar
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700/50">
                  <h2 className="text-lg font-medium text-white mb-4">Hesap Bilgileri</h2>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-400">Ad Soyad</p>
                      <p className="text-base text-white">{user.full_name || 'Belirtilmemiş'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">E-posta</p>
                      <p className="text-base text-white">{user.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Son Giriş</p>
                      <p className="text-base text-white">{user.last_login ? new Date(user.last_login).toLocaleString('tr-TR') : 'Belirtilmemiş'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700/50">
                  <h2 className="text-lg font-medium text-white mb-4">Hesap Yönetimi</h2>
                  <div className="space-y-4">
                    <button 
                      onClick={() => router.push('/profile/edit')}
                      className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg focus:outline-none transition-colors"
                    >
                      <i className="ri-user-settings-line mr-2"></i>
                      Profili Düzenle
                    </button>
                    <button 
                      onClick={() => router.push('/profile/change-password')}
                      className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg focus:outline-none transition-colors"
                    >
                      <i className="ri-lock-password-line mr-2"></i>
                      Şifre Değiştir
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 text-center">
                <p className="text-sm text-gray-400">
                  Hesabınızla ilgili sorun yaşıyorsanız lütfen <a href="/contact" className="text-purple-400 hover:text-purple-300">iletişim</a> sayfasından bizimle iletişime geçin.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400">Kullanıcı bilgileri yüklenemedi. Lütfen tekrar giriş yapın.</p>
              <button 
                onClick={() => router.push('/auth/login')}
                className="mt-4 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg focus:outline-none transition-colors"
              >
                Giriş Sayfasına Git
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 