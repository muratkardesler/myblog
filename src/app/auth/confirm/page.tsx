'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

function ConfirmContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function confirmEmailChange() {
      setLoading(true);
      try {
        // URL'den token değerlerini al
        const token_hash = searchParams.get('token_hash');
        const type = searchParams.get('type');
        
        if (!token_hash || !type) {
          setError('Geçersiz veya eksik doğrulama parametreleri. Lütfen e-posta bağlantınızı kontrol edin.');
          setLoading(false);
          return;
        }
        
        // Email değişikliği veya doğrulaması
        if (type === 'email_change' || type === 'signup') {
          const { error } = await supabase.auth.verifyOtp({ 
            token_hash, 
            type: type === 'email_change' ? 'email_change' : 'signup'
          });
          
          if (error) {
            throw error;
          }
          
          setSuccess(true);
          toast.success(type === 'signup' 
            ? 'E-posta adresiniz başarıyla doğrulandı! Şimdi giriş yapabilirsiniz.' 
            : 'E-posta adresiniz başarıyla değiştirildi!');
          
          // Başarılı doğrulama sonrası 3 saniye bekleyip yönlendir
          setTimeout(() => {
            router.push('/auth/login');
          }, 3000);
          
        } else {
          setError('Desteklenmeyen doğrulama türü.');
        }
      } catch (error: any) {
        console.error('Doğrulama hatası:', error);
        setError(error.message || 'Doğrulama sırasında bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    }

    confirmEmailChange();
  }, [searchParams, router, supabase.auth]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="max-w-md w-full bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-700">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {loading ? 'Doğrulanıyor...' : success ? 'Doğrulama Başarılı!' : 'Doğrulama Hatası'}
          </h1>
          
          <div className="mt-6">
            {loading ? (
              <div className="flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            ) : success ? (
              <div className="text-green-400 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-gray-300 mt-4">
                  Hesabınız başarıyla doğrulandı. Otomatik olarak giriş sayfasına yönlendiriliyorsunuz...
                </p>
              </div>
            ) : (
              <div className="text-red-400 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <p className="text-red-400 font-medium mt-2">{error}</p>
                <p className="text-gray-400 mt-4">
                  Doğrulama işlemi başarısız oldu. Lütfen tekrar deneyin veya yönetici ile iletişime geçin.
                </p>
              </div>
            )}
          </div>
          
          <div className="mt-6">
            <Link
              href="/auth/login"
              className="w-full inline-flex justify-center items-center px-4 py-2 bg-purple-600 border border-transparent rounded-md font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Giriş Sayfasına Dön
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
        <div className="max-w-md w-full bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-700">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-6">Doğrulanıyor...</h1>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          </div>
        </div>
      </div>
    }>
      <ConfirmContent />
    </Suspense>
  );
} 