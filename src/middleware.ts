import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  try {
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req: request, res })
    const { data: { session } } = await supabase.auth.getSession()

    // Pathname'i response header'larına ekle
    res.headers.set('x-pathname', request.nextUrl.pathname)

    // Admin sayfalarını kontrol et
    if (request.nextUrl.pathname.startsWith('/admin')) {
      // Login sayfasına erişimi her zaman izin ver
      if (request.nextUrl.pathname === '/admin/login') {
        // Eğer kullanıcı zaten giriş yapmışsa admin paneline yönlendir
        if (session) {
          return NextResponse.redirect(new URL('/admin', request.url))
        }
        return res
      }

      // Diğer admin sayfaları için giriş kontrolü
      if (!session) {
        return NextResponse.redirect(new URL('/admin/login', request.url))
      }
    }

    return res
  } catch (error) {
    console.error('Middleware error:', error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    '/admin/:path*'
  ]
} 