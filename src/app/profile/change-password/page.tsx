'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function ChangePasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClient();
  
  // Form durumu
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
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
      } catch (error) {
        console.error("Şifre değiştirme sayfası yüklenirken hata:", error);
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
    
    // Şifre kontrolü
    if (formData.password.length < 6) {
      toast.error('Şifre en az 6 karakter olmalıdır.');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Şifreler eşleşmiyor.');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Şifreyi güncelle
      const { error } = await supabase.auth.updateUser({
        password: formData.password
      });
      
      if (error) {
        throw error;
      }
      
      toast.success('Şifreniz başarıyla güncellendi');
      
      // Formu temizle
      setFormData({
        password: '',
        confirmPassword: '',
      });
      
      // Profil sayfasına yönlendir
      router.push('/profile');
    } catch (error) {
      console.error('Şifre güncelleme hatası:', error);
      toast.error('Şifre güncellenirken bir hata oluştu.');
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
          <p className="mt-4 text-gray-400">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 pt-20">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-white">Şifre Değiştir</h1>
            <Link href="/profile" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors">
              <i className="ri-arrow-left-line mr-1"></i> Geri Dön
            </Link>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-2">Yeni Şifre</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-900/70 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Yeni şifreniz"
                />
                <p className="mt-1 text-xs text-gray-500">Şifreniz en az 6 karakter olmalıdır</p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-400 mb-2">Şifre Tekrar</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-900/70 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Şifrenizi tekrar girin"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg focus:outline-none transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 