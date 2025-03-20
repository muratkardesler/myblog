'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient, getCurrentUser, refreshAuthSession } from '@/lib/supabase';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function ProfileEditPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClient();
  
  // Form durumu
  const [formData, setFormData] = useState({
    full_name: '',
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        
        // Oturum kontrolü
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          // Oturum yoksa giriş sayfasına yönlendir
          console.log("Oturum bulunamadı, giriş sayfasına yönlendiriliyor...");
          router.push('/auth/login');
          return;
        }
        
        // Oturum varsa kullanıcı bilgilerini al
        const userInfo = await getCurrentUser();
        
        if (!userInfo.success || !userInfo.user) {
          // Oturumu yenilemeyi dene
          const refreshResult = await refreshAuthSession();
          
          if (!refreshResult.success) {
            toast.error('Oturum bilgisi alınamadı. Lütfen tekrar giriş yapın.');
            router.push('/auth/login');
            return;
          }
          
          // Yeniden kullanıcı bilgilerini getir
          const refreshedUserInfo = await getCurrentUser();
          
          if (!refreshedUserInfo.success) {
            toast.error('Kullanıcı bilgileriniz alınamadı. Lütfen tekrar giriş yapın.');
            router.push('/auth/login');
            return;
          }
          
          setUser(refreshedUserInfo.user);
          setFormData({
            full_name: refreshedUserInfo.user?.full_name || '',
          });
        } else {
          setUser(userInfo.user);
          setFormData({
            full_name: userInfo.user?.full_name || '',
          });
        }
      } catch (error) {
        console.error("Profil sayfası yüklenirken hata:", error);
        toast.error("Oturumunuzda bir sorun oluştu. Lütfen tekrar giriş yapın.");
        router.push('/auth/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, supabase.auth]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Kullanıcı bilgisi bulunamadı.");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Kullanıcı profilini güncelle
      const { error } = await supabase
        .from('users')
        .update({
          full_name: formData.full_name,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
      
      if (error) {
        throw error;
      }
      
      toast.success('Profil bilgileriniz başarıyla güncellendi');
      router.push('/profile');
    } catch (error) {
      console.error('Profil güncelleme hatası:', error);
      toast.error('Profil güncellenirken bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
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
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-white">Profil Düzenle</h1>
            <Link href="/profile" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors">
              <i className="ri-arrow-left-line mr-1"></i> Geri Dön
            </Link>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <label htmlFor="full_name" className="block text-sm font-medium text-gray-400 mb-2">Ad Soyad</label>
                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-900/70 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Ad Soyad"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">E-posta</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  className="w-full px-4 py-2 bg-gray-900/70 border border-gray-700 rounded-lg text-gray-500 cursor-not-allowed"
                  disabled
                />
                <p className="mt-1 text-xs text-gray-500">E-posta adresinizi değiştiremezsiniz</p>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg focus:outline-none transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 