import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextRequest, NextResponse } from 'next/server'

// Oturum gerektiren sayfa yolları
const protectedRoutes = [
  '/profile',
  '/profile/settings',
  '/profile/work-logs',
]

// Admin sayfaları
const adminRoutes = [
  '/admin'
]

// Oturum olmadan erişim engellenen yolları kontrol et
const isProtectedRoute = (path: string) => {
  return protectedRoutes.some(route => path.startsWith(route))
}

// Admin sayfalarını kontrol et
const isAdminRoute = (path: string) => {
  return adminRoutes.some(route => path.startsWith(route) && path !== '/admin/login')
}

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  try {
    // Localhost yönlendirmesi düzeltme
    const url = req.nextUrl.clone()
    
    // Eğer confirm sayfasında code parametresi varsa ve localhosta yönlendirme varsa,
    // gerçek siteye yönlendir
    if (url.pathname.startsWith('/auth/confirm') && url.hostname === 'localhost') {
      // Canlı site URL'si (kendi sitenizin URL'sini buraya yazın)
      const productionUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://muratblog.com'
      
      // URL'yi üret
      const newUrl = new URL(url.pathname + url.search, productionUrl)
      
      return NextResponse.redirect(newUrl)
    }
    
    // Supabase client oluştur
    const supabase = createMiddlewareClient({ req, res })
    
    // Oturum bilgisini al
    const { data: { session } } = await supabase.auth.getSession()
    
    const path = req.nextUrl.pathname
    
    // Admin sayfası kontrolü - ayrı yönlendirme
    if (isAdminRoute(path)) {
      if (!session) {
        // Oturum yoksa admin giriş sayfasına yönlendir
        const redirectUrl = new URL('/admin/login', req.url)
        return NextResponse.redirect(redirectUrl)
      }
    }
    
    // Korumalı sayfa kontrolü (admin olmayan sayfalar için)
    if (isProtectedRoute(path)) {
      if (!session) {
        // Oturum yoksa giriş sayfasına yönlendir
        const redirectUrl = new URL('/auth/login', req.url)
        redirectUrl.searchParams.set('redirect', path)
        return NextResponse.redirect(redirectUrl)
      }
    }
    
    // Giriş/kayıt sayfası kontrolü - zaten oturum açıksa ana sayfaya yönlendir
    if ((path === '/auth/login' || path === '/auth/register') && session) {
      return NextResponse.redirect(new URL('/', req.url))
    }
    
    // Normal durumlarda sayfayı yükle
    return res
    
  } catch (error) {
    console.error('Middleware hatası:', error)
    
    // Hata durumunda ana sayfaya yönlendir
    if (req.nextUrl.pathname.startsWith('/profile') || 
        req.nextUrl.pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/', req.url))
    }
    
    return res
  }
}

export const config = {
  matcher: [
    // Tüm sayfalar için middleware uygula ancak bu yolları hariç tut:
    '/((?!api|_next/static|_next/image|favicon.ico|fonts|images).*)'
  ]
} 