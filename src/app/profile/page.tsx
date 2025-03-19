'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import { logoutUser } from '@/lib/supabase';
import toast from 'react-hot-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AuthInput from '@/components/AuthInput';
import { User } from '@/lib/types';

interface FormData {
  full_name: string;
  email: string;
  password: string;
  password_confirm: string;
}

interface FormErrors {
  full_name?: string;
  password?: string;
  password_confirm?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<FormData>({
    full_name: '',
    email: '',
    password: '',
    password_confirm: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Oturum kontrolü ve kullanıcı bilgilerini yükleme
    const checkAuth = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        router.push('/auth/login');
        return;
      }
      
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', sessionData.session.user.id)
        .single();
      
      if (error) {
        console.error('Kullanıcı bilgileri yüklenirken hata:', error);
        toast.error('Kullanıcı bilgileri yüklenemedi.');
        return;
      }
      
      setUser(userData);
      setFormData(prev => ({
        ...prev,
        full_name: userData.full_name,
        email: userData.email,
      }));
    };
    
    checkAuth();
  }, [router, supabase]);

  const validateForm = () => {
    const newErrors: FormErrors = {};
    
    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Ad Soyad alanı zorunludur';
    }
    
    if (formData.password) {
      if (formData.password.length < 6) {
        newErrors.password = 'Şifre en az 6 karakter olmalıdır';
      }
      
      if (formData.password !== formData.password_confirm) {
        newErrors.password_confirm = 'Şifreler eşleşmiyor';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Profil bilgilerini güncelle
      const updates = {
        full_name: formData.full_name,
        updated_at: new Date().toISOString(),
      };
      
      const { error: updateError } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user?.id);
      
      if (updateError) throw updateError;
      
      // Şifre değişimi isteği varsa
      if (formData.password) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: formData.password,
        });
        
        if (passwordError) throw passwordError;
      }
      
      toast.success('Profil bilgileriniz güncellendi.');
      
      // Şifre alanlarını temizle
      setFormData(prev => ({
        ...prev,
        password: '',
        password_confirm: '',
      }));
    } catch (error) {
      console.error('Profil güncelleme hatası:', error);
      toast.error('Profil güncellenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      const result = await logoutUser();
      
      if (result.success) {
        toast.success('Çıkış yapıldı.');
        router.push('/');
      } else {
        toast.error('Çıkış yapılırken bir hata oluştu.');
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Beklenmeyen bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
      <main className="min-h-screen bg-gray-900 pt-20">
        <div className="max-w-3xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white">Profilim</h1>
              <p className="text-gray-400 mt-2">Hesap bilgilerinizi yönetin</p>
            </div>
            <button
              onClick={handleLogout}
              disabled={loading}
              className="flex items-center text-gray-400 hover:text-white transition-colors"
            >
              <i className="ri-logout-box-line mr-2"></i>
              Çıkış Yap
            </button>
          </div>
          
          {/* Üyelere Özel Duyuru */}
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-6 mb-6">
            <div className="flex items-start">
              <div className="shrink-0 bg-purple-500/20 w-12 h-12 flex items-center justify-center rounded-xl mr-4">
                <i className="ri-vip-crown-fill text-2xl text-purple-400"></i>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Üyelere Özel İçerikler</h3>
                <p className="text-gray-300">
                  Çok yakında blog üyelerine özel içerikler, kaynaklar ve indirimler sunacağız. 
                  Üyeliğiniz ile ilgili güncellemeler için bu sayfayı takip etmeye devam edin.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <div className="bg-purple-500/10 rounded-lg px-3 py-1 text-sm text-purple-300 flex items-center">
                    <i className="ri-book-mark-line mr-1"></i> Özel blog yazıları
                  </div>
                  <div className="bg-purple-500/10 rounded-lg px-3 py-1 text-sm text-purple-300 flex items-center">
                    <i className="ri-download-line mr-1"></i> İndirilebilir kaynaklar
                  </div>
                  <div className="bg-purple-500/10 rounded-lg px-3 py-1 text-sm text-purple-300 flex items-center">
                    <i className="ri-gift-line mr-1"></i> Özel indirimler
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8">
            <h2 className="text-xl font-bold text-white mb-6">Profil Bilgilerim</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <AuthInput
                type="text"
                id="full_name"
                name="full_name"
                label="Ad Soyad"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Adınız ve soyadınız"
                required
                icon="ri-user-line"
                error={errors.full_name}
              />
              
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  E-posta
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <i className="ri-mail-line text-gray-400"></i>
                  </div>
                  <input
                    type="email"
                    value={formData.email}
                    className="w-full px-4 pl-10 py-2 bg-gray-700 border border-gray-700 rounded-xl text-gray-300 focus:outline-none"
                    disabled
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-xs px-2 py-0.5 bg-gray-600 text-gray-300 rounded-full">
                      Değiştirilemez
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-700 pt-6 mt-6">
                <h3 className="text-lg font-medium text-white mb-4">Şifre Değiştir</h3>
                
                <AuthInput
                  type="password"
                  id="password"
                  name="password"
                  label="Yeni Şifre"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Boş bırakırsanız değişmez"
                  icon="ri-lock-line"
                  error={errors.password}
                  isPassword
                />
                
                <AuthInput
                  type="password"
                  id="password_confirm"
                  name="password_confirm"
                  label="Yeni Şifre Tekrar"
                  value={formData.password_confirm}
                  onChange={handleChange}
                  placeholder="Şifrenizi tekrar giriniz"
                  icon="ri-lock-line"
                  error={errors.password_confirm}
                  isPassword
                />
              </div>
              
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl focus:outline-none transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <i className="ri-loader-4-line animate-spin mr-2"></i>
                      Güncelleniyor...
                    </span>
                  ) : (
                    'Profili Güncelle'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
} 