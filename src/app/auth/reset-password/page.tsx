'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import { resetPassword, updatePassword } from '@/lib/supabase';
import toast from 'react-hot-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AuthInput from '@/components/AuthInput';

interface ResetFormData {
  email: string;
}

interface UpdateFormData {
  password: string;
  password_confirm: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  password_confirm?: string;
}

// SearchParams içeren bileşen
function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();
  
  const [resetFormData, setResetFormData] = useState<ResetFormData>({ email: '' });
  const [updateFormData, setUpdateFormData] = useState<UpdateFormData>({
    password: '',
    password_confirm: '',
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    // Linkteki token varlığına göre modu belirle
    const hasResetToken = searchParams.has('token');
    setIsUpdateMode(hasResetToken);
    
    // Zaten oturum açmış kullanıcı varsa anasayfaya yönlendir
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session && !hasResetToken) {
        router.push('/');
      }
    };
    
    checkAuth();
  }, [router, searchParams, supabase.auth]);

  const validateResetForm = () => {
    const newErrors: FormErrors = {};
    
    if (!resetFormData.email.trim()) {
      newErrors.email = 'E-posta alanı zorunludur';
    } else if (!/^\S+@\S+\.\S+$/.test(resetFormData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi giriniz';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateUpdateForm = () => {
    const newErrors: FormErrors = {};
    
    if (!updateFormData.password) {
      newErrors.password = 'Yeni şifre alanı zorunludur';
    } else if (updateFormData.password.length < 6) {
      newErrors.password = 'Şifre en az 6 karakter olmalıdır';
    }
    
    if (updateFormData.password !== updateFormData.password_confirm) {
      newErrors.password_confirm = 'Şifreler eşleşmiyor';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setResetFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleUpdateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUpdateFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateResetForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await resetPassword(resetFormData.email);
      
      if (!result.success) {
        toast.error('Şifre sıfırlama işlemi sırasında bir hata oluştu.');
        return;
      }
      
      setEmailSent(true);
      toast.success('Şifre sıfırlama linki e-posta adresinize gönderildi.');
    } catch (error) {
      console.error('Password reset error:', error);
      toast.error('Beklenmeyen bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateUpdateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await updatePassword(updateFormData.password);
      
      if (!result.success) {
        toast.error('Şifre güncelleme işlemi sırasında bir hata oluştu.');
        return;
      }
      
      toast.success('Şifreniz başarıyla güncellendi. Giriş sayfasına yönlendiriliyorsunuz.');
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    } catch (error) {
      console.error('Password update error:', error);
      toast.error('Beklenmeyen bir hata oluştu.');
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
            {isUpdateMode ? (
              <>
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold text-white">Yeni Şifre Oluştur</h1>
                  <p className="text-gray-400 mt-2">
                    Hesabınız için yeni bir şifre belirleyin
                  </p>
                </div>
                
                <form onSubmit={handleUpdateSubmit} className="space-y-6">
                  <AuthInput
                    type="password"
                    id="password"
                    name="password"
                    label="Yeni Şifre"
                    value={updateFormData.password}
                    onChange={handleUpdateChange}
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
                    label="Yeni Şifre Tekrar"
                    value={updateFormData.password_confirm}
                    onChange={handleUpdateChange}
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
                        İşleniyor...
                      </span>
                    ) : (
                      'Şifremi Güncelle'
                    )}
                  </button>
                </form>
              </>
            ) : emailSent ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-500/20 rounded-full mx-auto flex items-center justify-center mb-6">
                  <i className="ri-mail-send-line text-3xl text-green-400"></i>
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">E-posta Gönderildi</h2>
                <p className="text-gray-400 mb-6">
                  Şifre sıfırlama linki {resetFormData.email} adresine gönderildi. Lütfen e-posta kutunuzu kontrol edin.
                </p>
                <Link
                  href="/auth/login"
                  className="text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Giriş sayfasına dön
                </Link>
              </div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold text-white">Şifremi Unuttum</h1>
                  <p className="text-gray-400 mt-2">
                    Şifrenizi sıfırlamak için hesap e-postanızı girin
                  </p>
                </div>
                
                <form onSubmit={handleResetSubmit} className="space-y-6">
                  <AuthInput
                    type="email"
                    id="email"
                    name="email"
                    label="E-posta"
                    value={resetFormData.email}
                    onChange={handleResetChange}
                    placeholder="ornek@email.com"
                    required
                    icon="ri-mail-line"
                    error={errors.email}
                  />
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl focus:outline-none transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <i className="ri-loader-4-line animate-spin mr-2"></i>
                        Link gönderiliyor...
                      </span>
                    ) : (
                      'Sıfırlama Linki Gönder'
                    )}
                  </button>
                </form>
                
                <div className="mt-6 text-center text-sm">
                  <p className="text-gray-400">
                    Şifrenizi hatırladınız mı?{' '}
                    <Link href="/auth/login" className="text-purple-400 hover:text-purple-300 transition-colors">
                      Giriş Yap
                    </Link>
                  </p>
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

// Ana bileşen
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <i className="ri-loader-4-line animate-spin text-4xl text-purple-500"></i>
          </div>
          <p className="text-gray-300">Yükleniyor...</p>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
} 