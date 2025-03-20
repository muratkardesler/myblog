import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  try {
    const res = NextResponse.next()
    const supabase = createMiddlewareClient<any>({
      req: request,
      res: res
    })
    
    const { data } = await supabase.auth.getSession()
    const session = data.session

    // Pathname'i response header'larına ekle
    res.headers.set('x-pathname', request.nextUrl.pathname)

    // Ziyaret sayısını kaydet
    const pathname = request.nextUrl.pathname
    // Admin sayfalarını ve API rotalarını kaydetme
    if (!pathname.startsWith('/admin') && !pathname.startsWith('/api') && !pathname.includes('_next')) {
      try {
        // IP adresini al (Next.js 12.2+ için geo.ip kullanılır)
        const ip = request.headers.get('x-forwarded-for') || 'unknown'
        // User agent bilgisini al
        const userAgent = request.headers.get('user-agent') || 'unknown'
        // Referrer bilgisini al
        const referrer = request.headers.get('referer') || 'direct'

        // Ziyareti kaydet
        await supabase.from('page_visits').insert({
          page: pathname,
          ip_address: ip,
          user_agent: userAgent,
          referrer: referrer
        })
      } catch (error) {
        console.error('Ziyaret kaydedilirken hata oluştu:', error)
      }
    }

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
    '/((?!_next/static|_next/image|favicon.ico).*)'
  ]
} 