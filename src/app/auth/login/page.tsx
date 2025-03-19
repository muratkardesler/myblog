'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import { loginUser } from '@/lib/supabase';
import toast from 'react-hot-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AuthInput from '@/components/AuthInput';

interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Kullanıcı zaten giriş yapmışsa anasayfaya yönlendir
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;
    
    const checkAuth = async () => {
      try {
        // Rate limit sorunlarını engellemek için localStorage kontrolü
        const localSession = localStorage.getItem('supabase.auth.token');
        
        // Eğer localStorage'da oturum bilgisi varsa, direkt yönlendir
        if (localSession) {
          router.push('/');
          return;
        }
        
        // Yoksa Supabase'e sorgu at
        const { data } = await supabase.auth.getSession();
        if (data.session && isMounted) {
          timeoutId = setTimeout(() => {
            router.push('/');
          }, 100);
        }
      } catch (error) {
        console.error('Oturum kontrolü hatası:', error);
      }
    };
    
    checkAuth();
    
    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [router, supabase.auth]);

  const validateForm = () => {
    const newErrors: FormErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'E-posta alanı zorunludur';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi giriniz';
    }
    
    if (!formData.password) {
      newErrors.password = 'Şifre alanı zorunludur';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Anlık doğrulama
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
      const result = await loginUser(formData.email, formData.password);
      
      if (!result.success) {
        if (result.error && typeof result.error === 'object' && 'message' in result.error) {
          const errorMessage = result.error.message as string;
          
          if (errorMessage.includes('E-posta adresi veya şifre hatalı')) {
            setErrors({
              email: 'E-posta adresi veya şifre hatalı',
              password: 'E-posta adresi veya şifre hatalı'
            });
          } else {
            toast.error(errorMessage || 'Giriş işlemi sırasında bir hata oluştu.');
          }
        } else {
          toast.error('Giriş işlemi sırasında bir hata oluştu.');
        }
        setLoading(false);
        return;
      }
      
      // Başarılı giriş animasyonu ve mesajı
      toast.success('Giriş başarılı! Yönlendiriliyorsunuz...');

      // Giriş başarılı mesajını görmeleri için kısa bir gecikme
      setTimeout(() => {
        router.push('/');
      }, 1500);
      
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Beklenmeyen bir hata oluştu.');
      setLoading(false);
    }
  };

  return (
    <>
      <Header mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
      <main className="min-h-screen bg-gray-900 pt-20">
        <div className="max-w-md mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white">Giriş Yap</h1>
              <p className="text-gray-400 mt-2">
                Hesabınıza giriş yapın
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <AuthInput
                type="email"
                id="email"
                name="email"
                label="E-posta"
                value={formData.email}
                onChange={handleChange}
                placeholder="ornek@email.com"
                required
                icon="ri-mail-line"
                error={errors.email}
              />
              
              <AuthInput
                type="password"
                id="password"
                name="password"
                label="Şifre"
                value={formData.password}
                onChange={handleChange}
                placeholder="Şifrenizi girin"
                required
                icon="ri-lock-line"
                error={errors.password}
                isPassword
              />
              
              <div className="flex items-center justify-end">
                <Link href="/auth/reset-password" className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
                  Şifremi Unuttum
                </Link>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl focus:outline-none transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <i className="ri-loader-4-line animate-spin mr-2"></i>
                    Giriş yapılıyor...
                  </span>
                ) : (
                  'Giriş Yap'
                )}
              </button>
            </form>
            
            <div className="mt-6 text-center text-sm">
              <p className="text-gray-400">
                Hesabınız yok mu?{' '}
                <Link href="/auth/register" className="text-purple-400 hover:text-purple-300 transition-colors">
                  Üye Olun
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
} 