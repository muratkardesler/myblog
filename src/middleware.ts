import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const { pathname } = req.nextUrl

  // Statik dosyaları ve API rotalarını yoksay
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return res
  }

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Admin sayfalarını koruma
  if (pathname.startsWith('/admin')) {
    // Admin giriş sayfasına özel kontrol
    if (pathname === '/admin') {
      // Eğer kullanıcı zaten giriş yapmışsa dashboard'a yönlendir
      if (session) {
        return NextResponse.redirect(new URL('/admin/dashboard', req.url))
      }
      return res
    }

    // Diğer admin sayfaları için auth kontrolü
    if (!session) {
      return NextResponse.redirect(new URL('/admin', req.url))
    }
  }

  return res
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 