'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter, usePathname } from 'next/navigation';
import { FiHome, FiLogOut } from 'react-icons/fi'
import Link from 'next/link'
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';

// Admin izin verilen e-posta adresleri - bu listeyi kendinize göre düzenleyin
const ADMIN_EMAILS = ['murat.kardesler3019@gmail.com'];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session && pathname !== '/admin/login') {
          // Oturum yoksa login sayfasına yönlendir
          router.push('/admin/login');
          return;
        }
        
        // Login sayfasında oturum kontrolü yapmadan direk göster
        if (pathname === '/admin/login') {
          setLoading(false);
          return;
        }
        
        // Eğer oturum varsa yetkili mi kontrol et
        if (session) {
          const userEmail = session.user.email;
          
          // E-postaya göre admin yetkisi kontrolü
          if (userEmail && ADMIN_EMAILS.includes(userEmail)) {
            setAuthorized(true);
            setLoading(false);
          } else {
            // Yetkisiz kullanıcı, ana sayfaya yönlendir
            toast.error('Admin paneline erişim yetkiniz bulunmamaktadır.');
            await supabase.auth.signOut();
            router.push('/');
          }
        }
      } catch (error) {
        console.error('Admin yetki kontrolü hatası:', error);
        router.push('/');
      }
    };

    checkUser();
  }, [router, supabase, pathname]);

  if (loading && pathname !== '/admin/login') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="flex items-center space-x-2 text-gray-400">
          <i className="ri-loader-4-line animate-spin text-2xl"></i>
          <span>Yükleniyor...</span>
        </div>
      </div>
    );
  }

  // Login sayfası için layout'u gösterme
  if (pathname === '/admin/login') {
    return (
      <>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1F2937',
              color: '#F3F4F6',
              borderRadius: '0.75rem',
            },
          }}
        />
        {children}
      </>
    );
  }

  // Eğer yetkisiz kullanıcıysa hiçbir şey gösterme (zaten yönlendirme yapılacak)
  if (!authorized && pathname !== '/admin/login') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="flex flex-col items-center justify-center space-y-4 p-6 bg-gray-800 rounded-xl border border-gray-700 max-w-md">
          <i className="ri-error-warning-fill text-4xl text-red-500"></i>
          <h1 className="text-xl font-bold text-white">Erişim Engellendi</h1>
          <p className="text-gray-400 text-center">Bu sayfaya erişim yetkiniz bulunmamaktadır.</p>
          <Link 
            href="/"
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 transition-colors mt-2"
          >
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1F2937',
            color: '#F3F4F6',
            borderRadius: '0.75rem',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#F3F4F6',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#F3F4F6',
            },
          },
        }}
      />

      {/* Üst menü */}
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              {/* Logo */}
              <div className="flex-shrink-0 flex items-center">
                <Link href="/admin" className="text-xl font-bold text-gray-100">
                  Admin Panel
                </Link>
              </div>
            </div>

            {/* Sağ taraftaki butonlar */}
            <div className="flex items-center space-x-4">
              <Link
                href="/admin"
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                title="Admin Paneli"
              >
                <FiHome className="w-5 h-5" />
              </Link>
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  router.push('/admin/login');
                }}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-300 hover:text-red-400 transition-colors"
                title="Çıkış Yap"
              >
                <FiLogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Ana içerik */}
      <main>
        {children}
      </main>

      {/* Alt bilgi */}
      <footer className="bg-gray-800 border-t border-gray-700">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-400">
            © 2024 Admin Panel. Tüm hakları saklıdır.
          </p>
        </div>
      </footer>
    </div>
  )
} 