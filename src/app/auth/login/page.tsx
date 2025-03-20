'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { loginUser, createClient } from '@/lib/supabase';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Sayfa yüklendiğinde oturum kontrolü yap
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Mevcut oturumu kontrol et
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // Oturum zaten varsa, profil sayfasına yönlendir
          console.log("Aktif oturum bulundu, yönlendiriliyor...");
          router.push('/profile');
        }
      } catch (error) {
        console.error("Oturum kontrolü hatası:", error);
        // Önbelleği temizle
        await fetch('/api/auth/clear-cache', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }
    };
    
    checkSession();
  }, [router, supabase.auth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      // Önce önbelleği temizle
      await fetch('/api/auth/clear-cache', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Login işlemini gerçekleştir
      const result = await loginUser(email, password);

      if (!result.success) {
        throw new Error(result.error?.message || 'Giriş başarısız oldu.');
      }

      // Başarılı giriş sonrası bildirim göster
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
                    <i className="ri-check-line text-xl text-blue-400"></i>
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-white">
                    Giriş Başarılı
                  </p>
                  <p className="mt-1 text-sm text-gray-300">
                    Hoş geldiniz! Profilinize yönlendiriliyorsunuz.
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

      // Sayfayı yenile ve profil sayfasına yönlendir
      router.refresh();
      router.push('/profile');
    } catch (error) {
      console.error('Giriş hatası:', error);
      
      // Hata mesajını göster
      let errorMessage = 'Giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.';
      
      if (error instanceof Error && error.message) {
        if (error.message.includes('credentials') || 
            error.message.includes('password') || 
            error.message.includes('email') ||
            error.message.includes('Invalid')) {
          errorMessage = 'E-posta veya şifre hatalı.';
        } else if (error.message.includes('disabled')) {
          errorMessage = 'Hesabınız engellenmiş durumda. Lütfen site yöneticisiyle iletişime geçin.';
        }
      }
      
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
                    Giriş Başarısız
                  </p>
                  <p className="mt-1 text-sm text-gray-300">
                    {errorMessage}
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
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="max-w-md w-full px-6 py-8 bg-gray-800 rounded-xl shadow-lg">
        <h2 className="text-center text-3xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 text-transparent bg-clip-text mb-6">
          Giriş Yap
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
              E-posta Adresi
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="appearance-none block w-full px-4 py-3 border border-gray-700 rounded-lg bg-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="adiniz@ornek.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
              Şifre
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                className="appearance-none block w-full px-4 py-3 border border-gray-700 rounded-lg bg-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-400 hover:text-white"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <i className="ri-eye-off-line text-lg"></i>
                ) : (
                  <i className="ri-eye-line text-lg"></i>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-purple-500 focus:ring-purple-500 border-gray-700 rounded bg-gray-700"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isLoading}
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                Beni hatırla
              </label>
            </div>

            <div className="text-sm">
              <Link
                href="/auth/reset-password"
                className="font-medium text-purple-400 hover:text-purple-300"
                prefetch={false}
              >
                Şifremi unuttum
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-70"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <i className="ri-loader-4-line animate-spin mr-2"></i>
                  Giriş yapılıyor...
                </span>
              ) : (
                'Giriş Yap'
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            Hesabınız yok mu?{' '}
            <Link
              href="/auth/register"
              className="font-medium text-purple-400 hover:text-purple-300"
              prefetch={false}
            >
              Hemen Kaydolun
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 