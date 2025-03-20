import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextRequest, NextResponse } from 'next/server';

// Oturum gerektiren sayfa yolları
const protectedRoutes = [
  '/profile',
  '/profile/settings',
  '/profile/work-logs',
  '/admin',
];

// Oturum olmadan erişim engellenen yolları kontrol et
const isProtectedRoute = (path: string) => {
  return protectedRoutes.some(route => path.startsWith(route));
};

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  
  try {
    // Supabase client oluştur
    const supabase = createMiddlewareClient({ req, res });
    
    // Oturum bilgisini al
    const { data: { session } } = await supabase.auth.getSession();
    
    const path = req.nextUrl.pathname;
    
    // Korumalı sayfa kontrolü
    if (isProtectedRoute(path)) {
      if (!session) {
        // Oturum yoksa giriş sayfasına yönlendir
        const redirectUrl = new URL('/auth/login', req.url);
        redirectUrl.searchParams.set('redirect', path);
        return NextResponse.redirect(redirectUrl);
      }
    }
    
    // Giriş/kayıt sayfası kontrolü - zaten oturum açıksa ana sayfaya yönlendir
    if ((path === '/auth/login' || path === '/auth/register') && session) {
      return NextResponse.redirect(new URL('/', req.url));
    }
    
    // Normal durumlarda sayfayı yükle
    return res;
    
  } catch (error) {
    console.error('Middleware hatası:', error);
    
    // Hata durumunda ana sayfaya yönlendir
    if (req.nextUrl.pathname.startsWith('/profile') || 
        req.nextUrl.pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/', req.url));
    }
    
    return res;
  }
} 