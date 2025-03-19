'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import { registerUser } from '@/lib/supabase';
import toast from 'react-hot-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AuthInput from '@/components/AuthInput';

interface FormData {
  full_name: string;
  email: string;
  password: string;
  password_confirm: string;
}

interface FormErrors {
  full_name?: string;
  email?: string;
  password?: string;
  password_confirm?: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
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
    // Kullanıcı zaten giriş yapmışsa anasayfaya yönlendir
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.push('/');
      }
    };
    
    checkAuth();
  }, [router, supabase.auth]);

  const validateForm = () => {
    const newErrors: FormErrors = {};
    
    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Ad Soyad alanı zorunludur';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'E-posta alanı zorunludur';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi giriniz';
    }
    
    if (!formData.password) {
      newErrors.password = 'Şifre alanı zorunludur';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Şifre en az 6 karakter olmalıdır';
    }
    
    if (formData.password !== formData.password_confirm) {
      newErrors.password_confirm = 'Şifreler eşleşmiyor';
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
      // Önce bu e-posta ile bir kullanıcı var mı kontrol et
      const { data: existingUsers, error: checkError } = await supabase.auth.signInWithOtp({
        email: formData.email,
        options: {
          shouldCreateUser: false,
        }
      });
      
      if (checkError && checkError.message !== "Email not confirmed") {
        console.error('E-posta kontrol hatası:', checkError);
      }
      
      const result = await registerUser(
        formData.email,
        formData.password,
        formData.full_name
      );
      
      if (!result.success) {
        console.error('Hata detayları:', result.error);
        
        if (result.error && typeof result.error === 'object') {
          // Supabase Auth hatası
          if ('message' in (result.error as any)) {
            const errorMessage = (result.error as any).message;
            
            // E-posta doğrulama hatası
            if (errorMessage.includes('email') || errorMessage.includes('already') || errorMessage.includes('registered')) {
              setErrors({ email: 'Bu e-posta adresi zaten kayıtlı. Doğrulama e-postasını kontrol edin veya giriş yapmayı deneyin.' });
              toast.error('Bu e-posta zaten kayıtlı. Gelen kutunuzu kontrol edin.');
            } else {
              toast.error(errorMessage || 'Kayıt işlemi sırasında bir hata oluştu');
            }
          } 
          // PostgreSQL duplicate key hatası
          else if ('code' in (result.error as any)) {
            const errorCode = (result.error as any).code;
            
            if (errorCode === '23505' || errorCode === '23514' || errorCode === '22P05') {
              setErrors({ email: 'Bu e-posta adresi zaten kayıtlı. Doğrulama e-postasını kontrol edin veya giriş yapmayı deneyin.' });
              toast.error('Bu e-posta zaten kayıtlı. Gelen kutunuzu kontrol edin.');
            } else {
              toast.error('Kayıt işlemi sırasında bir hata oluştu');
            }
          } else {
            toast.error('Kayıt işlemi sırasında bir hata oluştu');
          }
        } else {
          toast.error('Kayıt işlemi sırasında beklenmeyen bir hata oluştu');
        }
        return;
      }
      
      toast.success('Kayıt işlemi başarılı! Lütfen e-postanızı kontrol edip hesabınızı doğrulayın.');
      setFormData({
        full_name: '',
        email: '',
        password: '',
        password_confirm: '',
      });
    } catch (error) {
      console.error('Register error:', error);
      toast.error('Beklenmeyen bir hata oluştu');
    } finally {
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
              <h1 className="text-3xl font-bold text-white">Üye Ol</h1>
              <p className="text-gray-400 mt-2">
                Blog yazılarını beğenmek, yorum yapmak ve daha fazlası için üye olun
              </p>
            </div>
            
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
                placeholder="En az 6 karakter"
                required
                icon="ri-lock-line"
                error={errors.password}
                isPassword
              />
              
              <AuthInput
                type="password"
                id="password_confirm"
                name="password_confirm"
                label="Şifre Tekrar"
                value={formData.password_confirm}
                onChange={handleChange}
                placeholder="Şifrenizi tekrar giriniz"
                required
                icon="ri-lock-line"
                error={errors.password_confirm}
                isPassword
              />
              
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl focus:outline-none transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <i className="ri-loader-4-line animate-spin mr-2"></i>
                    Üye olunuyor...
                  </span>
                ) : (
                  'Üye Ol'
                )}
              </button>
            </form>
            
            <div className="mt-6 text-center text-sm">
              <p className="text-gray-400">
                Zaten üye misiniz?{' '}
                <Link href="/auth/login" className="text-purple-400 hover:text-purple-300 transition-colors">
                  Giriş Yap
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