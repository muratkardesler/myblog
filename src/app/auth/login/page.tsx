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
  const [isPageReady, setIsPageReady] = useState(false);

  useEffect(() => {
    const checkAuthStatusOnly = async () => {
      try {
        console.log("Login sayfası oturum durumu kontrolü");
        const { data: { session } } = await supabase.auth.getSession();
        
        setIsPageReady(true);
        
        if (session?.user) {
          console.log("Kullanıcı zaten giriş yapmış, ancak yönlendirme yapılmayacak");
        } else {
          console.log("Kullanıcı giriş yapmamış, login sayfası görüntüleniyor");
        }
      } catch (error) {
        console.error("Login sayfası oturum kontrolü hatası:", error);
        setIsPageReady(true);
      }
    };
    
    checkAuthStatusOnly();
  }, [supabase.auth]);

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
        // Hesap pasif durumunda özel mesaj
        if (result.error && 'code' in result.error && result.error.code === 'ACCOUNT_DISABLED') {
          toast.custom(
            (t) => (
              <div
                className={`${
                  t.visible ? 'animate-enter' : 'animate-leave'
                } max-w-md w-full bg-gradient-to-br from-red-900/90 to-red-800/90 backdrop-blur-md shadow-lg rounded-xl pointer-events-auto flex border border-red-500/30`}
              >
                <div className="flex-1 w-0 p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 pt-0.5">
                      <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center">
                        <i className="ri-lock-line text-xl text-red-400"></i>
                      </div>
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-white">
                        Hesap Engellendi
                      </p>
                      <p className="mt-1 text-sm text-gray-300">
                        {result.error?.message}
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
            { duration: 5000 }
          );
          return;
        }
        
        // Diğer hatalar için (mevcut kod)
        if (result.error?.message?.includes('Rate limit') || 
            result.error?.message?.includes('rate limit')) {
          toast.error('Çok fazla giriş denemesi yaptınız. Lütfen bir süre bekleyip tekrar deneyin.');
        } else {
          toast.error(result.error?.message || 'Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.');
        }
        return;
      }
      
      // Özel başarılı bildirim
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
      
      // Son giriş zamanını kaydet - bildirim kontrolü için
      window.localStorage.setItem('last_sign_in_time', new Date().getTime().toString());
      
      // Oturum kontrolünü tekrar yap ve yönlendir
      const { data } = await supabase.auth.getSession();
      console.log("Giriş sonrası oturum durumu:", data.session ? "Başarılı" : "Başarısız");
      
      // Yönlendirme yapmadan önce kısa bir bekleme ekle (session storage güncellemesi için)
      setTimeout(() => {
        router.refresh(); // Sayfayı yenile
        router.push('/'); // Anasayfaya yönlendir
      }, 500);
    } catch (error) {
      console.error('Giriş hatası:', error);
      const errorMessage = error instanceof Error ? error.message : 'Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.';
      
      if (errorMessage.includes('Rate limit') || 
          errorMessage.includes('rate limit')) {
        toast.error('Çok fazla giriş denemesi yaptınız. Lütfen bir süre bekleyip tekrar deneyin.');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
      <main className="min-h-screen bg-gray-900 pt-20">
        <div className="max-w-md mx-auto px-4 py-16 sm:px-6 lg:px-8">
          {isPageReady ? (
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
          ) : (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
} 